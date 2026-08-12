"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import Calendar, { CalendarEvent } from "@/components/calendars/Calendar";
import { useApp } from "@/components/context/NeptuneContext";
import CourseInline from "@/components/courses/CourseInline";
import MeetingsInline from "@/components/meetings/MeetingsInline";
import { DashboardCard } from "@/components/misc/DashboardCard";
import Greeting from "@/components/misc/Greeting";
import Header from "@/components/misc/Header";
import SmartOverview from "@/components/misc/SmartOverview";
import Button, { ButtonLooks } from "@/components/primitives/Button";
import Divider from "@/components/primitives/Divider";
import Subtext from "@/components/primitives/Subtext";
import EditTask from "@/components/tasks/EditTask";
import Task from "@/components/tasks/Task";
import { User } from "@/db/types";
import { throwToast } from "@/lib/errors";
import { getMeetingsOnDay, meetingToCalendar } from "@/lib/meetings";
import { titleCase } from "@/lib/string";
import { sortTasks, taskToCalendar } from "@/lib/tasks";
import { getCurrentTerm } from "@/lib/terms";
import { DAYS } from "@/lib/time";

import { getCalendarEvents, getUser } from "../actions/users";

export default function App() {
	const data = useApp();
	const { courses, meetings, tasks, terms } = data;
	const currentTerm = getCurrentTerm(terms);

	const [user, setUser] = useState<User>();

	const [courseViewMode, setCourseViewMode] = useState<"today" | "tomorrow" | "all">("today");

	const [icalEvents, setIcalEvents] = useState<CalendarEvent[]>([]);

	const [editingTask, setEditingTask] = useState<string>();

	// Fetches from listed iCal source.
	useEffect(() => {
		getCalendarEvents().then(setIcalEvents).catch(e => throwToast("Could not fetch iCal events", e));
		getUser().then(setUser).catch(e => throwToast("Could not fetch user", e));
	}, []);

	if (!user)
		return null;

	// Gets all the courses that have a meeting based on the selected view mode, in the order that they happen.
	const coursesDisplay = courses
		// Only courses for the current term
		.filter(course => course.termId === currentTerm?.id)
		.filter(course => {
			// Gets all of the courses for the given view mode, then returns only the courses that have meetings within the view
			const courseMeetings = meetings.filter(m => m.courseId === course.id);
			const day = new Date(new Date().getTime() + (courseViewMode === "tomorrow" ? 1 * DAYS : 0));
			const courseMeetingsToday = courseViewMode === "all" ? courseMeetings : getMeetingsOnDay(courseMeetings, courses, getCurrentTerm(data.terms), day);

			return courseMeetingsToday.length >= 1;
		}).sort((a, b) => {
			// Sorts courses by their meeting times
			const aCourseMeetings = meetings.filter(m => m.courseId === a.id);
			const bCourseMeetings = meetings.filter(m => m.courseId === b.id);

			const day = new Date(new Date().getTime() + (courseViewMode === "tomorrow" ? 1 * DAYS : 0));
			const aMeetingsToday = courseViewMode === "all" ? aCourseMeetings : getMeetingsOnDay(aCourseMeetings, courses, getCurrentTerm(data.terms), day);
			const bMeetingsToday = courseViewMode === "all" ? bCourseMeetings : getMeetingsOnDay(bCourseMeetings, courses, getCurrentTerm(data.terms), day);

			// There really should only be one meeting a day, if there is more than one, this still uses the first
			return aMeetingsToday[0].timeStart - bMeetingsToday[0].timeStart;
	});

	return <main className="mx-auto w-[95%] md:w-200 overflow-x-hidden">
		<Header />
		<Divider />

		<DashboardCard className="w-full mb-2">
			<Greeting />
			{currentTerm ? <SmartOverview /> : <p>Enjoy your break!</p>}
		</DashboardCard>

		<div className="md:flex md:gap-2 mb-2 max-h-150">
			<DashboardCard className="md:mb-0 mb-2">
				<div className="flex justify-between items-end">
					<h2>
						{courseViewMode === "today" && "Today"}
						{courseViewMode === "tomorrow" && "Tomorrow"}
						{courseViewMode === "all" && (currentTerm ? `${titleCase(currentTerm.season)} ${currentTerm.year}` : "All Courses")}
					</h2>
					<div className="flex *:py-1 text-sm">
						<Button look={ButtonLooks.SECONDARY2} onClick={() => setCourseViewMode("today")} className={courseViewMode === "today" ? "bg-bg-lightest" : ""}>
							today
						</Button>
						<Button look={ButtonLooks.SECONDARY2} onClick={() => setCourseViewMode("tomorrow")} className={courseViewMode === "tomorrow" ? "bg-bg-lightest" : ""}>
							tomorrow
						</Button>
						<Button look={ButtonLooks.SECONDARY2} onClick={() => setCourseViewMode("all")} className={courseViewMode === "all" ? "bg-bg-lightest" : ""}>
							all
						</Button>
					</div>
				</div>

				{!coursesDisplay.length && <>
					<Divider />
					<Subtext className="w-full text-center">Enjoy the day off!</Subtext>
				</>}
				{coursesDisplay.map(course => <div key={course.id}>
					<Divider />
					<CourseInline course={course} />
					<MeetingsInline meetings={meetings.filter(m => m.courseId === course.id)} />
				</div>)}
			</DashboardCard>
			<DashboardCard>
				<h2>Tasks</h2>
				<Divider />

				{!editingTask && <button className="w-full flex justify-center bg-bg py-1 mb-1 cursor-pointer hover:bg-bg-lighter" onClick={() => setEditingTask("new")}>
					<Plus size={16} />
				</button>}
				{editingTask === "new" && <EditTask onEditEnd={() => setEditingTask("")} />}

				{/* Sort by due date */}
				{sortTasks(tasks).map(task =>
					editingTask === task.id ?
						<EditTask task={task} key={task.id} onEditEnd={() => setEditingTask(undefined)} /> :
						<Task task={task} key={task.id} />
				)}
			</DashboardCard>
		</div>
		<DashboardCard className="mb-2">
			<h2>Your Schedule</h2>
			<Divider />

			<Calendar events={[
				...meetings.map(m => meetingToCalendar(data, m.id)).filter(e => !!e),
				...tasks.map(t => taskToCalendar(data, user!, t)).filter(e => !!e),
				...icalEvents
			]} />
		</DashboardCard>
	</main>;
}
