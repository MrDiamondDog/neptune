"use client";

import { Plus, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import Calendar, { CalendarEvent } from "@/components/calendars/Calendar";
import { useApp } from "@/components/context/NeptuneContext";
import CourseInline from "@/components/courses/CourseInline";
import EditCourseModal from "@/components/courses/EditCourseModal";
import MeetingsInline from "@/components/meetings/MeetingsInline";
import Button, { ButtonLooks } from "@/components/primitives/Button";
import Divider from "@/components/primitives/Divider";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/primitives/Dropdown";
import Subtext from "@/components/primitives/Subtext";
import EditTask from "@/components/tasks/EditTask";
import Task from "@/components/tasks/Task";
import { throwToast } from "@/lib/errors";
import { getDayOfWeekAbbr, meetingToCalendar } from "@/lib/meetings";
import { titleCase } from "@/lib/string";
import { sortTasks } from "@/lib/tasks";
import { getCurrentTerm } from "@/lib/terms";

import { getCalendarEvents } from "../actions/users";

function DashboardCard({ children }: React.PropsWithChildren) {
	return <div className="w-full border-2 border-bg-lighter bg-bg-light p-2 max-h-[750px] overflow-x-hidden overflow-y-scroll">
		{children}
	</div>;
}

export default function App() {
	const session = useSession();

	const data = useApp();
	const { courses, meetings, tasks, terms } = data;
	const currentTerm = getCurrentTerm(terms);

	const [courseViewMode, setCourseViewMode] = useState<"today" | "tomorrow" | "all">("today");

	const [icalEvents, setIcalEvents] = useState<CalendarEvent[]>([]);

	const [editingTask, setEditingTask] = useState<string>();
	const [openModal, setOpenModal] = useState("");

	// Fetches from listed iCal source.
	useEffect(() => {
		getCalendarEvents().then(setIcalEvents).catch(e => throwToast("Could not fetch iCal events", e));
	}, []);

	if (!session || !session.data?.user)
		return null;

	// Gets all the courses that have a meeting based on the selected view mode, in the order that they happen.
	// Also gets the courses that are in the current term
	const coursesDisplay = courses
		.filter(course => course.termId === currentTerm?.id)
		.filter(course => {
			const day = getDayOfWeekAbbr(courseViewMode === "tomorrow" ? 1 : 0);
			const courseMeetingsToday = meetings.filter(m => m.courseId === course.id)
				.filter(m => courseViewMode !== "all" ? m.days.includes(day) : true);

			return courseMeetingsToday.length >= 1;
		}).sort((a, b) => {
			const dayToday = getDayOfWeekAbbr();
			const aMeetingsToday = meetings.filter(m => m.courseId === a.id)
				.filter(m => m.days.includes(dayToday));
			const bMeetingsToday = meetings.filter(m => m.courseId === b.id)
				.filter(m => m.days.includes(dayToday));

			// There really should only be one meeting a day, if there is more than one, this still uses the first
			return aMeetingsToday[0].timeStart - bMeetingsToday[0].timeStart;
	});

	return <main className="mx-auto w-fit min-w-200">
		<div className="flex w-full justify-between items-center mt-2">
			<h1>Good morning, {session.data.user.name}</h1>
			<div className="flex gap-2 items-center">
				<Dropdown>
					<DropdownTrigger asChild>
						<Button><Plus /></Button>
					</DropdownTrigger>
					<DropdownContent>
						<DropdownItem onClick={() => setOpenModal("new-course")}>New Course...</DropdownItem>
					</DropdownContent>
				</Dropdown>
				<a href="/app/settings">
					<Button look={ButtonLooks.SECONDARY}><Settings /></Button>
				</a>
			</div>
		</div>
		<Divider />

		<div className="flex gap-2 mb-2">
			<DashboardCard>
				<div className="flex justify-between items-end">
					<h2>
						{courseViewMode === "today" && "Your Day"}
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
		<DashboardCard>
			<h2>Your Schedule</h2>
			<Divider />

			<Calendar events={[...meetings.map(m => meetingToCalendar(data, m.id)).filter(e => !!e), ...icalEvents]} />
		</DashboardCard>
		<Divider />

		<EditCourseModal open={openModal === "new-course"} onClose={() => setOpenModal("")} />
	</main>;
}
