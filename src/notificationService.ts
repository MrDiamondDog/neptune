// This file does not run with nextjs; it is separate and is used to send notifications to users.
import { config } from "dotenv";
import { eq, isNotNull } from "drizzle-orm";
import webpush from "web-push";

import { coursesTable, db, meetingsTable, tasksTable, termsTable, usersTable } from "./db/schema";
import { Course, Meeting, Task, Term, User, UserNotificationKeys } from "./db/types";
import { getMeetingsOnDay } from "./lib/meetings";
import { list } from "./lib/string";
import { getCurrentTerm } from "./lib/terms";
import { DAYS, MINUTES, minutesToTime, timeToMinutes } from "./lib/time";
import { exit } from "process";

config({ quiet: true });

if (process.env.ALLOW_NOTIFICATIONS !== "true") {
	console.error("[notif-service] Notifications are not enabled.");
	exit(0);
}

process.env.TZ = "Etc/UTC";

function getTasksOnDay(tasks: Task[], day: Date) {
	return tasks.filter(t => !t.complete && t.dueDate && t.dueDate.getFullYear() === day.getFullYear() &&
		t.dueDate.getMonth() === day.getMonth() &&
		t.dueDate.getDate() === day.getDate());
}

type Notification = {
	title: string;
	message: string;
	topic: string;
};

type NotificationPredicate = {
	key: UserNotificationKeys;
	predicate: (user: { user: User, terms: Term[], courses: Course[], meetings: Meeting[], tasks: Task[] }) => Notification | null;
};

const notifications: NotificationPredicate[] = [
	{
		// Reminders for courses soon
		key: "courses",
		predicate: ({ user, courses, meetings, terms }) => {
			const userDate = new Date(new Date().getTime() - user.timezoneOffset * MINUTES);
			const meetingsToday = getMeetingsOnDay(meetings, courses, getCurrentTerm(terms));
			if (!meetingsToday.length)
				return null;

			const timeInMins = userDate.getHours() * 60 + userDate.getMinutes();
			for (const meeting of meetingsToday) {
				const course = courses.find(c => c.id === meeting.courseId)!;
				if (meeting.timeStart + user.timezoneOffset - 15 === timeInMins) {
					return {
						title: "Reminder",
						message: `${course.name} starts in 15 minutes!`,
						topic: "courses"
					};
				}
			}

			return null;
		}
	},
	{
		// List of tasks after all classes are done
		key: "tasks",
		predicate: ({ user, meetings, courses, terms, tasks }) => {
			const userDate = new Date(new Date().getTime() - user.timezoneOffset * MINUTES);
			const meetingsToday = getMeetingsOnDay(meetings, courses, getCurrentTerm(terms)).sort((a, b) => a.timeStart - b.timeStart);
			if (!meetingsToday.length)
				return null;

			const timeInMins = userDate.getHours() * 60 + userDate.getMinutes();
			const lastCourseEnd = meetingsToday[meetingsToday.length - 1].timeEnd;
			if (lastCourseEnd + user.timezoneOffset === timeInMins) {
				const today = userDate;
				const tomorrow = new Date(today.getTime() + DAYS);

				const tasksToday = getTasksOnDay(tasks, today);
				const tasksUpcoming = [...getTasksOnDay(tasks, tomorrow), ...getTasksOnDay(tasks, new Date(tomorrow.getTime() + DAYS))];

				let bodyStr = "";

				if (tasksToday.length)
					bodyStr = `Tonight, you need to finish ${list(...tasksToday.map(t => t.title))}.`;
				else if (tasksUpcoming.length)
					bodyStr = `You have nothing due tonight, but you should start working on ${list(...tasksUpcoming.map(t => t.title))}.`;
				else if (!tasksToday.length && !tasksUpcoming.length)
					bodyStr = "You have nothing due tonight!";

				return {
					title: "Task Reminder",
					message: bodyStr,
					topic: "tasks",
				};
			}

			return null;
		}
	},
	{
		key: "morning-overview",
		predicate: ({ user, terms, courses, meetings, tasks }) => {
			const userDate = new Date(new Date().getTime() - user.timezoneOffset * MINUTES);
			if (userDate.getHours() !== 7 || userDate.getMinutes() !== 0)
				return null;
			const meetingsToday = getMeetingsOnDay(meetings, courses, getCurrentTerm(terms));

			const timeInMins = userDate.getHours() * 60 + userDate.getMinutes();
			const meetingsLater = meetingsToday.filter(t => t.timeStart + user.timezoneOffset > timeInMins);

			const coursesLater = courses.filter(c => meetingsLater.map(m => m.courseId).includes(c.id))
				.sort((a, b) => meetingsToday.find(m => m.courseId === a.id)!.timeStart - meetingsToday.find(m => m.courseId === b.id)!.timeStart);

			let courseText = "";
			// One meeting later today
			if (meetingsLater.length === 1) {
				const course = coursesLater.find(c => c.id === meetingsLater[0].courseId)!;
				courseText = `You just have ${course.name} at ${minutesToTime(meetingsLater[0].timeStart)}.`;
			// More than one meeting later today
			} else if (meetingsLater.length > 1) {
				const courses = meetingsLater.map(m => coursesLater.find(c => c.id === m.courseId)!);
				const strs = courses.map(c => `${c.name} at ${minutesToTime(meetingsLater.find(m => m.courseId === c.id)!.timeStart)}`);

				courseText = `You have ${list(...strs)}.`;
			// No meetings today
			} else if (!meetingsToday.length || !meetingsLater.length) {
				const meetingsTomorrow = getMeetingsOnDay(meetings, courses, getCurrentTerm(terms), new Date(new Date().getTime() + 1 * DAYS));

				const coursesTomorrow = courses.filter(c => meetingsTomorrow.map(m => m.courseId).includes(c.id))
						.sort((a, b) => meetingsTomorrow.find(m => m.courseId === a.id)!.timeStart - meetingsTomorrow.find(m => m.courseId === b.id)!.timeStart);

				const todayText = meetingsToday.length ? "All done today!" : "No classes today!";

				if (!meetingsTomorrow.length)
					courseText = todayText;

				const strs = coursesTomorrow.map(c => c.name);
				courseText = `${todayText} Tomorrow, you have ${list(...strs)}.`;
			}
			const tasksToday = getTasksOnDay(tasks, new Date());

			if (!meetingsToday.length && !tasksToday.length)
				return {
					title: `Good Morning, ${user.name}!`,
					message: "You have no classes today or tasks due tonight!",
					topic: "morning-overview"
				};

			return {
				title: `Good Morning, ${user.name}!`,
				message: `${courseText}\n${tasksToday.length === 0 ? "You have no tasks due tonight!" : `You have ${tasksToday.length} task${tasksToday.length > 1 ? "s" : ""} due later tonight.`}`,
				topic: "morning-overview"
			};
		}
	}
];

webpush.setVapidDetails(
	"https://neptune.drewrat.dev/",
	process.env.VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!
);

async function sendNotification(userId: string, notif: Notification) {
	const user = (await db.select().from(usersTable).where(eq(usersTable.id, userId)))[0];

	if (!user || !user.pushSubscription)
		throw "No user found with push subscription";

	console.log("[notif-service] Sending notification to " + userId);

	try {
		await webpush.sendNotification(
			user.pushSubscription,
			JSON.stringify({
				title: notif.title,
				body: notif.message,
				icon: "/neptune.png",
			})
		);
		return { success: true };
	} catch (error) {
		console.error("Error sending push notification:", error);
		return { success: false, error: "Failed to send notification" };
	}
}

async function checkForNotifications() {
	console.time("[notif-service] Notif check took");
	console.log("[notif-service] Checking for notifications for all subscribed users");

	const users = await db.select().from(usersTable).where(isNotNull(usersTable.pushSubscription));

	console.log(`[notif-service] Found ${users.length} subscribed users`);

	for (const user of users) {
		// Subscribed but no notifications turned on
		if (Object.values(user.pushNotifications).filter(v => !!v).length === 0)
			continue;

		const userData = {
			user,
			terms: [] as Term[],
			courses: [] as Course[],
			meetings: [] as Meeting[],
			tasks: [] as Task[],
		};

		await Promise.all([
			db.select().from(termsTable).where(eq(termsTable.userId, user.id)).then(terms => userData.terms = terms),
			db.select().from(coursesTable).where(eq(coursesTable.userId, user.id)).then(courses => userData.courses = courses),
			db.select().from(meetingsTable).where(eq(meetingsTable.userId, user.id)).then(meetings => userData.meetings = meetings),
			db.select().from(tasksTable).where(eq(tasksTable.userId, user.id)).then(tasks => userData.tasks = tasks),
		]);

		for (const [key, enabled] of Object.entries(user.pushNotifications)) {
			if (!enabled)
				continue;

			const notif = notifications.find(n => n.key === key)?.predicate(userData);
			if (notif)
				sendNotification(user.id, notif);
		}
	}
	console.timeEnd("[notif-service] Notif check took");
}

if (process.argv.includes("--now")) {
	console.log("[notif-service] Started with --now flag");
	checkForNotifications().catch(console.log);
	setInterval(() => {
		checkForNotifications().catch(console.log);
	}, 1000 * 60);
} else {
	console.log("[notif-service] Starting, waiting for minute turn");
	setTimeout(() => {
		checkForNotifications().catch(console.log);
		setInterval(() => {
			checkForNotifications().catch(console.log);
		}, 1000 * 60);
		console.log("[notif-service] Started");
	}, 1000 * (60 - new Date().getSeconds()));
}
