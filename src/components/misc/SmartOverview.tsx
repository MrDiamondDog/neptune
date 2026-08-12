"use client";

import React from "react";

import { Course } from "@/db/types";
import { getDimmedColor } from "@/lib/colors";
import { getMeetingsOnDay, minutesToTime } from "@/lib/meetings";
import { getCurrentTerm } from "@/lib/terms";
import { DAYS, timeToMinutes } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";

export function NodeList({ nodes }: { nodes: React.ReactNode[] }): React.ReactNode {
	if (nodes.length === 1)
		return nodes[0];
	if (nodes.length === 2)
		return <>{nodes[0]} and {nodes[1]}`</>;

	let node = <></>;
	for (let i = 0; i < nodes.length; i++)
		node = <>{node}{nodes[i]}{(i === nodes.length - 1 ? "" : (i === nodes.length - 2 ? ", and " : ", "))}</>;
	return node;
}

function CourseTitle({ children: course }: { children: Course }) {
	return <span style={{ backgroundColor: getDimmedColor(course.color), border: `1px solid ${course.color}`, padding: "0 1px" }}>{course.name}</span>;
}

export default function SmartOverview() {
	const data = useApp();

	const meetingsToday = getMeetingsOnDay(data.meetings, data.courses, getCurrentTerm(data.terms)).sort((a, b) => a.timeStart - b.timeStart);

	const timeMinutes = timeToMinutes(`${new Date().getHours()}:${new Date().getMinutes()}`);
	const meetingsLater = meetingsToday.filter(t => t.timeStart > timeMinutes);

	const coursesLater = data.courses.filter(c => meetingsLater.map(m => m.courseId).includes(c.id));

	// One meeting later today
	if (meetingsLater.length === 1) {
		const course = coursesLater.find(c => c.id === meetingsLater[0].courseId)!;
		return <>You've just got <CourseTitle>{course}</CourseTitle> at {minutesToTime(meetingsLater[0].timeStart)}.</>;
	// More than one meeting later today
	} else if (meetingsLater.length > 1) {
		const courses = meetingsLater.map(m => coursesLater.find(c => c.id === m.courseId)!);
		const nodes = courses.map(c => <><CourseTitle>{c}</CourseTitle> at {minutesToTime(meetingsLater.find(m => m.courseId === c.id)!.timeStart)}</>);

		return <p>You've got <NodeList nodes={nodes} />.</p>;
	// No meetings today
	} else if (!meetingsToday.length || !meetingsLater.length) {
		const meetingsTomorrow = getMeetingsOnDay(data.meetings, data.courses, getCurrentTerm(data.terms), new Date(new Date().getTime() + 1 * DAYS)).sort((a, b) => a.timeStart - b.timeStart);
		const coursesTomorrow = data.courses.filter(c => meetingsTomorrow.map(m => m.courseId).includes(c.id));

		const todayText = meetingsToday.length ? "All done today!" : "No classes today!";

		if (!meetingsTomorrow.length)
			return todayText;

		const nodes = coursesTomorrow.map(c => <CourseTitle key={c.id}>{c}</CourseTitle>);
		return <p>{todayText} Tomorrow, you've got <NodeList nodes={nodes} />.</p>;
	}

	return null;
}
