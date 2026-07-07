"use client";

import WeeklyCalendar from "@/components/calendars/WeeklyCalendar";
import { useApp } from "@/components/context/NeptuneContext";
import CourseInline from "@/components/courses/CourseInline";
import MeetingsInline from "@/components/meetings/MeetingsInline";
import Divider from "@/components/primitives/Divider";
import { getDayOfWeekAbbr, meetingToCalendar } from "@/lib/meetings";
import { useSession } from "next-auth/react";

function DashboardCard({ children }: React.PropsWithChildren) {
	return <div className="w-full border-2 border-bg-lighter bg-bg-light p-2">
		{children}
	</div>
}

export default function App() {
	const session = useSession();

	const data = useApp();
	const { courses, meetings } = data;

	if (!session || !session.data?.user)
		return null;

	const coursesToday = courses.filter(course => {
		const dayToday = getDayOfWeekAbbr();
		const courseMeetingsToday = meetings.filter(m => m.courseId === course.id)
			.filter(m => m.days.includes(dayToday));

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
		<h1>Good morning, {session.data.user.name}</h1>
		<Divider />

		<div className="flex gap-2 mb-2">
			<DashboardCard>
				<h2>Your Day</h2>

				{coursesToday.map(course => <div key={course.id}>
					<Divider />
					<CourseInline course={course} />
					<MeetingsInline meetings={meetings.filter(m => m.courseId === course.id)} />
				</div>)}
			</DashboardCard>
			<DashboardCard>
				<h2>Tasks</h2>
				<Divider />
			</DashboardCard>
		</div>
		<DashboardCard>
			<h2>Your Schedule</h2>
			<Divider />

			<WeeklyCalendar events={meetings.map(m => meetingToCalendar(data, m.id)).filter(e => !!e)} />
		</DashboardCard>
	</main>
}
