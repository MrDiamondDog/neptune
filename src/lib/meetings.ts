import { RecurringEvent } from "@/components/calendars/WeeklyCalendar";
import { NeptuneData } from "@/components/context/NeptuneContext";
import { Course, Meeting, Term } from "@/db/types";

const dayOrder = [..."UMTWRFS"];

/**
 * Sorts a days-of-the-week string by order of days of the week.
 * Ex. "WM" (Wednesday Monday) => "MW" (Monday Wednesday)
 * Defaults to UMTWRFS order.
 */
export function sortDaysOfWeek(days: string): string {
	return [...days].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)).join("");
}

/**
 * Sorts and converts abbriviated days of week to 3-letter versions
 */
export function prettyDaysOfWeek(days: string): string {
	const abbr = {
		"U": "Sun",
		"M": "Mon",
		"T": "Tue",
		"W": "Wed",
		"R": "Thu",
		"F": "Fri",
		"S": "Sat"
	};

	return [...sortDaysOfWeek(days)].map(d => abbr[d as keyof typeof abbr]).join(", ")
}

/**
 * Converts minute of day into time of day.
 */
export function minutesToTime(mins: number, mode: "24" | "12" = "12"): string {
	let hours = Math.floor(mins / 60);
	const minutes = mins - hours * 60;

	const ampm = hours >= 12 ? "pm" : "am";
	if (hours > 12 && mode === "12") {
		hours -= 12;
	}

	return `${hours}:${minutes < 10 ? "0" : ""}${minutes}${mode === "12" ? ampm : ""}`
}

/**
 * Gets the current day of the week as a single letter abbriviation.
 */
export function getDayOfWeekAbbr(): string {
	return dayOrder[new Date().getDay()];
}

export function meetingToCalendar(data: NeptuneData, meetingId: string): RecurringEvent | null {
	const meeting = data.meetings.find(m => m.id === meetingId);
	if (!meeting)
		return null;

	const course = data.courses.find(c => c.id === meeting.courseId);
	if (!course)
		return null;

	const term = data.terms.find(t => t.id === course.termId);
	if (!term)
		return null;

	return {
		id: meeting.id,
		title: course.name,
		daysOfWeek: [...meeting.days].map(d => dayOrder.indexOf(d)),
		startRecur: term.start,
		// Add one day to term end since endRecur is exclusive for some reason
		endRecur: new Date(term.end.getTime() + 1000 * 60 * 60 * 24),
		startTime: minutesToTime(meeting.timeStart, "24"),
		endTime: minutesToTime(meeting.timeEnd, "24"),
	}
}
