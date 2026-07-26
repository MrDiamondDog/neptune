"use client";

import { stringsToList } from "@/lib/array";
import { getDayOfWeekAbbr, getMeetingsOnDay, minutesToTime } from "@/lib/meetings";
import { timeToMinutes } from "@/lib/time";

import { useApp } from "./context/NeptuneContext";

export default function SmartOverview() {
	const data = useApp();

	function getCoursesText() {
		const meetingsToday = getMeetingsOnDay(data.meetings).sort((a, b) => a.timeStart - b.timeStart);

		const timeMinutes = timeToMinutes(`${new Date().getHours()}:${new Date().getMinutes()}`);
		const meetingsLater = meetingsToday.filter(t => t.timeStart > timeMinutes);

		const coursesLater = data.courses.filter(c => meetingsLater.map(m => m.courseId).includes(c.id));

		if (meetingsLater.length === 1) {
			const course = coursesLater.find(c => c.id === meetingsLater[0].courseId)!;
			return `You've just got ${course.name} at ${minutesToTime(meetingsLater[0].timeStart)}.`;
		} else if (meetingsLater.length > 1) {
			const courses = meetingsLater.map(m => coursesLater.find(c => c.id === m.courseId)!);
			const strings = courses.map(c => `${c.name} at ${minutesToTime(meetingsLater.find(m => m.courseId === c.id)!.timeStart)}`);
			return `You've got ${stringsToList(strings)}.`;
		} else if (!meetingsToday.length || !meetingsLater.length) {
			const meetingsTomorrow = getMeetingsOnDay(data.meetings, getDayOfWeekAbbr(1)).sort((a, b) => a.timeStart - b.timeStart);
			const coursesTomorrow = data.courses.filter(c => meetingsTomorrow.map(m => m.courseId).includes(c.id));

			const todayText = meetingsToday.length ? "All done today!" : "No classes today!";

			if (!meetingsTomorrow.length)
				return todayText;

			const strings = coursesTomorrow.map(c => c.name);
			return `${todayText} Tomorrow, you've got ${stringsToList(strings)}.`;
		}
	}

	return <p>{getCoursesText()}</p>;
}
