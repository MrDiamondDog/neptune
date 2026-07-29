import { eq } from "drizzle-orm";
import ical, { ICalEventBusyStatus, ICalEventRepeatingFreq, ICalEventTransparency, ICalWeekday } from "ical-generator";
import { NextRequest, NextResponse } from "next/server";
import { RRule } from "rrule";

import { coursesTable, db, meetingsTable,tasksTable,termsTable, usersTable } from "@/db/schema";
import { getUniqueInstructors, getUniqueLocations, minutesToTime, prettyDaysOfWeek, sortDaysOfWeek } from "@/lib/meetings";
import { DAYS, MINUTES, toUTCDate } from "@/lib/time";

const daysOfWeek = [..."UMTWRFS"];
const icalDaysOfWeek = {
	U: "SU",
	M: "MO",
	T: "TU",
	W: "WE",
	R: "TH",
	F: "FR",
	S: "SA"
};
const rruleDaysOfWeek = {
	U: RRule.SU,
	M: RRule.MO,
	T: RRule.TU,
	W: RRule.WE,
	R: RRule.TH,
	F: RRule.FR,
	S: RRule.SA
};

/**
 * This API route responds with a valid iCal file to use within other calendar apps.
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/ical/[userId]">) {
	// Javascript dates are the stupidest thing ever, this is what you have to do to make it consistent across timezones
	process.env.TZ = "Etc/UTC";

	const params = await ctx.params;
	const userId = params.userId.replace(".ics", "");

	const user = (await db.select().from(usersTable).where(eq(usersTable.id, userId)))[0];

	if (!user)
		return new NextResponse("User not found", { status: 404 });

	const terms = await db.select().from(termsTable).where(eq(termsTable.userId, userId));
	const courses = await db.select().from(coursesTable).where(eq(coursesTable.userId, userId));
	const meetings = await db.select().from(meetingsTable).where(eq(meetingsTable.userId, userId));
	const tasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));

	const calendar = ical({
		name: "Neptune",
	});

	meetings.forEach(meeting => {
		const course = courses.find(c => c.id === meeting.courseId)!;
		const allCourseMeetings = meetings.filter(m => m.courseId === course.id);
		const term = terms.find(t => t.id === course.termId)!;

		const meetingDays = sortDaysOfWeek(meeting.days);

		// Term start time + the day of week to position the first event correctly + start time.
		const recurStartTime = new Date(
			term.start.getTime() +
			(DAYS * daysOfWeek.indexOf(meetingDays[0])) +
			(meeting.timeStart * MINUTES) +
			(user.timezoneOffset * MINUTES)
		);

		// Converts meeting days to ical format
		const recurByDay = [...meetingDays].map(d => icalDaysOfWeek[d as keyof typeof icalDaysOfWeek]);

		let description = `${course.subject}${course.number}\n`;

		const uniqueInstructors = getUniqueInstructors(allCourseMeetings);
		const uniqueLocations = getUniqueLocations(allCourseMeetings);

		if (uniqueInstructors.length === 1)
			description += `${uniqueInstructors[0]}\n`;
		if (uniqueLocations.length === 1)
			description += `${uniqueLocations[0]}\n`;

		allCourseMeetings.forEach(m => description +=
			`${prettyDaysOfWeek(m.days)} | ${minutesToTime(m.timeStart, "12", user.timezoneOffset)} - ${minutesToTime(m.timeEnd, "12", user.timezoneOffset)} ` +
			(uniqueLocations.length > 1 ? `| ${m.location} ` : "") +
			(uniqueInstructors.length > 1 ? `| ${m.instructor} ` : "") + "\n"
		);

		// Make sure it's an array, (fixed) db bug that put in "[]" instead of [] as the default
		const exclusions = (Array.isArray(meeting.exclusions) ? meeting.exclusions : [])
			.map(e => new Date(e.toString()))
			// Filter out invalid dates (old db bug that I fixed)
			.filter(d => !Number.isNaN(d.getTime()));

		calendar.createEvent({
			summary: course.name,
			timezone: "-06",
			start: toUTCDate(recurStartTime),
			// Start time + duration in minutes
			end: toUTCDate(new Date(recurStartTime.getTime() + MINUTES * (meeting.timeEnd - meeting.timeStart))).toISOString(),
			repeating: {
				freq: ICalEventRepeatingFreq.WEEKLY,
				startOfWeek: ICalWeekday.SU,
				until: term.end,
				byDay: recurByDay as ICalWeekday[],
				exclude: exclusions.length ? exclusions : undefined,
				interval: 1
			},
			busystatus: ICalEventBusyStatus.BUSY,
			transparency: ICalEventTransparency.OPAQUE,
			location: meeting.location ?? undefined,
			description: description.trim()
		});
	});

	// TODO: implement this as normal VEVENTS cause nothing supports VTODO
	// ical-generator doesn't have support for anything other than VEVENT, so this is how we're implementing VTODO!
	// let calendarStr = calendar.toString().replace("END:VCALENDAR", "");

	// tasks.filter(t => t.dueDate).forEach(task => {
	// 	calendarStr += [
	// 		"BEGIN:VTODO",
	// 		`UID:task-${task.id}`,
	// 		`DTSTAMP:${new Date().toISOString().replaceAll(/\.|:|-/g, "")}`,
	// 		`DUE:${task.dueDate!.toISOString().replaceAll(/\.|:|-/g, "")}`,
	// 		`SUMMARY:${task.title}`,
	// 		...(task.complete ? [`COMPLETED:${task.dueDate!.toISOString().replaceAll(/\.|:|-/g, "")}`] : []),
	// 		"END:VTODO"
	// 	].join("\n");
	// 	calendarStr += "\n";
	// });

	// calendarStr += "END:VCALENDAR";

	return new NextResponse(calendar.toString());
}
