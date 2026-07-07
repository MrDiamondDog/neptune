"use client";

import { useApp } from "@/components/context/NeptuneContext";
import CourseInline from "@/components/courses/CourseInline";
import MeetingsInline from "@/components/meetings/MeetingsInline";
import Divider from "@/components/primitives/Divider";
import { getDayOfWeekAbbr } from "@/lib/meetings";
import { useSession } from "next-auth/react";

function DashboardCard({ children }: React.PropsWithChildren) {
	return <div className="w-full border-2 border-bg-lighter bg-bg-light p-2">
		{children}
	</div>
}

export default function App() {
	const session = useSession();

	const { courses, meetings } = useApp();

	if (!session || !session.data?.user)
		return null;

	const coursesToday = courses.filter(course => {
		const dayToday = getDayOfWeekAbbr();
		const courseMeetingsToday = meetings.filter(m => m.courseId === course.id)
			.filter(m => m.days.includes(dayToday));

		return courseMeetingsToday.length >= 1;
	});

	return <main className="mx-auto w-fit min-w-150">
		<h1>Good morning, {session.data.user.name}</h1>
		<Divider />

		<div className="flex gap-2">
			<DashboardCard>
				<h2>Your day</h2>

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
	</main>
}
