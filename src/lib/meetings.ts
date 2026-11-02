import { RRule, Weekday } from "rrule";
import { Temporal } from "temporal-spec";

import { RecurringEvent } from "@/components/calendars/Calendar";
import { NeptuneData } from "@/components/context/NeptuneContext";
import { Course, Meeting, MeetingInsert, Term } from "@/db/types";

import { getDimmedColor } from "./colors";
import { toUTCDate } from "./time";


const daysOfWeek = {
	"U": "Sun",
	"M": "Mon",
	"T": "Tue",
	"W": "Wed",
	"R": "Thu",
	"F": "Fri",
	"S": "Sat"
};
const dayOrder = [..."UMTWRFS"];
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
 * Sorts a days-of-the-week string by order of days of the week.
 * Ex. "WM" (Wednesday Monday) => "MW" (Monday Wednesday)
 * Defaults to UMTWRFS order.
 * @param days
 */
export function sortDaysOfWeek(days: string): string {
	return [...days].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)).join("");
}

/**
 * Sorts and converts abbriviated days of week to 3-letter versions
 * @param days
 */
export function prettyDaysOfWeek(days: string): string {
	return [...sortDaysOfWeek(days)].map(d => daysOfWeek[d as keyof typeof daysOfWeek]).join(", ");
}

/**
 * Converts minute of day into time of day.
 * @param mins The minute of day.
 * @param mode 24/12 hour mode for the output time.
 */
export function minutesToTime(mins: number, mode: "24" | "12" = "12"): string {
	let hours = Math.floor(mins / 60);
	const minutes = mins - hours * 60;

	const ampm = hours >= 12 ? "pm" : "am";
	if (hours > 12 && mode === "12") {
		hours -= 12;
	}

	return `${hours}:${minutes < 10 ? "0" : ""}${minutes}${mode === "12" ? ampm : ""}`;
}

/**
 * Gets the current day of the week as a single letter abbriviation.
 * @param date The date to get the day of week. Defaults to new Date
 */
export function getDayOfWeekAbbr(date?: Date) {
	return dayOrder[(date ?? new Date()).getDay()];
}

// TODO: Convert to Temporal
/**
 * Converts a meeting object to a FullCalendar event.
 * @param data from `useApp`
 * @param meetingId The meetingId to convert
 * @returns A recurring event of the meeting.
 */
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

	const dayOffset = dayOrder.indexOf(sortDaysOfWeek(meeting.days)[0]);
	const firstMeeting = Temporal.Instant.fromEpochMilliseconds(term.start);
	firstMeeting.add({ days: dayOffset });
	firstMeeting.add({ minutes: meeting.timeStart });

	let byweekday: Weekday[] = [];
	byweekday = [...sortDaysOfWeek(meeting.days)].map(d => rruleDaysOfWeek[d as keyof typeof rruleDaysOfWeek]);

	return {
		id: `meeting-${meeting.id}`,
		title: course.name,
		duration: Temporal.Duration.from({ minutes: meeting.timeEnd - meeting.timeStart }),
		exdate: meeting.exclusions ?? undefined,
		color: getDimmedColor(course.color),
		borderColor: course.color,
		rrule: new RRule({
			freq: RRule.WEEKLY,
			interval: 1,
			byweekday,
			dtstart: firstMeeting.toString(),
			until: toUTCDate(term.end),
			wkst: RRule.SU,
		}).toString()
	};
}

/**
 * Gets a list of all the unique instructors among the meetings to change how it is displayed if there is one.
 * Also reverses the name to "Last, First"
 * @param meetings The meetings to get the instructors for
 * @returns A set of unique instructors, not including undefined or null fields.
 */
export function getUniqueInstructors(meetings: (Meeting | MeetingInsert)[]): string[] {
	return meetings.map(m => m.instructor).filter(p => p !== null && p !== undefined)
		.reduce((prev, curr) => (!prev.includes(curr) ? [...prev, curr] : prev), [] as string[])
		.map(i => i.split(" ").reverse().join(", "));
}

/**
 * Gets a list of all the unique instructors among the meetings to change how it is displayed if there is one.
 * @param meetings The meetings to get the locations for
 * @returns A set of unique locations, not including undefined or null fields.
 */
export function getUniqueLocations(meetings: (Meeting | MeetingInsert)[]): string[] {
	return meetings.map(m => m.location).filter(l => l !== null && l !== undefined)
		.reduce((prev, curr) => (!prev.includes(curr) ? [...prev, curr] : prev), [] as string[]);
}

// TODO: Convert to Temporal
/**
 * Gets all of the meetings that occur on a specific day of week in the given term.
 * @param meetings The meetings to filter.
 * @param courses All courses. (from `useApp`)
 * @param currentTerm The current term
 * @param day Date to use (defaults to now)
 * @returns All of the meetings that take place on the given day of week in the given term.
 */
export function getMeetingsOnDay(meetings: Meeting[], courses: Course[], currentTerm?: Term, day?: Date): Meeting[] {
	if (!day)
		day = new Date();

	return meetings.filter(m =>
		m.days.includes(getDayOfWeekAbbr(day)) &&
		courses.find(c => c.id === m.courseId)?.termId === currentTerm?.id &&
		!([...(m.exclusions ?? [])]
			.map(e => new Date(e.toString()))
			.find(e => e.getDate() === day.getDate() && e.getMonth() === day.getMonth() && e.getFullYear() === day.getFullYear()))
	);
}
