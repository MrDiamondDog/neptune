"use client";

import { PopoverTrigger } from "@radix-ui/react-popover";

import { Course, Meeting } from "@/db/types";
import { getDimmedColor } from "@/lib/colors";
import { getMeetingsOnDay, minutesToTime } from "@/lib/meetings";
import { getCurrentTerm } from "@/lib/terms";
import { DAYS, MINUTES, timeToMinutes } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import CourseInline from "../courses/CourseInline";
import MeetingsInline from "../meetings/MeetingsInline";
import { Popover, PopoverContent } from "../primitives/Popover";
import NodeList from "./NodeList";

function CourseTitle({ course, meetings }: { course: Course, meetings: Meeting[] }) {
	const meeting = meetings.find(m => m.courseId === course.id)!;

	const today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);

	return <Popover>
		<PopoverTrigger asChild>
			<span style={{ backgroundColor: getDimmedColor(course.color), border: `1px solid ${course.color}`, padding: "0 1px" }} className="cursor-pointer">
				{course.name}
			</span>
		</PopoverTrigger>
		<PopoverContent side="bottom" className="border border-bg-lighter">
			<CourseInline course={course} meetingId={meeting.id} day={new Date(today.getTime() + meeting.timeStart * MINUTES)} />
			<MeetingsInline meetings={meetings.filter(m => m.courseId === course.id)} />
		</PopoverContent>
	</Popover>;
}

export default function CourseOverview() {
	const data = useApp();

	const meetingsToday = getMeetingsOnDay(data.meetings, data.courses, getCurrentTerm(data.terms));

	const timeMinutes = timeToMinutes(`${new Date().getHours()}:${new Date().getMinutes()}`);
	const meetingsLater = meetingsToday.filter(t => t.timeStart > timeMinutes);

	const coursesLater = data.courses.filter(c => meetingsLater.map(m => m.courseId).includes(c.id))
		.sort((a, b) => meetingsToday.find(m => m.courseId === a.id)!.timeStart - meetingsToday.find(m => m.courseId === b.id)!.timeStart);

	// One meeting later today
	if (meetingsLater.length === 1) {
		const course = coursesLater.find(c => c.id === meetingsLater[0].courseId)!;
		return <>You just have <CourseTitle course={course} meetings={meetingsLater} /> at {minutesToTime(meetingsLater[0].timeStart)}.</>;
	// More than one meeting later today
	} else if (meetingsLater.length > 1) {
		const courses = meetingsLater.map(m => coursesLater.find(c => c.id === m.courseId)!);
		const nodes = courses.map(c => <><CourseTitle course={c} meetings={meetingsLater} /> at {minutesToTime(meetingsLater.find(m => m.courseId === c.id)!.timeStart)}</>);

		return <p>You have <NodeList nodes={nodes} />.</p>;
	// No meetings today
	} else if (!meetingsToday.length || !meetingsLater.length) {
		const meetingsTomorrow = getMeetingsOnDay(data.meetings, data.courses, getCurrentTerm(data.terms), new Date(new Date().getTime() + 1 * DAYS));

		const coursesTomorrow = data.courses.filter(c => meetingsTomorrow.map(m => m.courseId).includes(c.id))
				.sort((a, b) => meetingsTomorrow.find(m => m.courseId === a.id)!.timeStart - meetingsTomorrow.find(m => m.courseId === b.id)!.timeStart);

		const todayText = meetingsToday.length ? "All done today!" : "No classes today!";

		if (!meetingsTomorrow.length)
			return todayText;

		const nodes = coursesTomorrow.map(c => <CourseTitle key={c.id} course={c} meetings={meetingsTomorrow} />);
		return <p>{todayText} Tomorrow, you have <NodeList nodes={nodes} />.</p>;
	}

	return null;
}
