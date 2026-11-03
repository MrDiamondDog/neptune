import { CalendarEvent } from "@/components/calendars/Calendar";
import { NeptuneData } from "@/components/context/NeptuneContext";
import { Task, User } from "@/db/types";

import { getDimmedColor } from "./colors";
import { epochToTemporal, unitTime } from "./time";

export type DateMatcher = {
	/**
	 * The regex to match in the string. Should have "i" flags.
	 */
	match: RegExp;
	/**
	* The priority of this matcher. The higher, the more important.
	*/
	priority: number;
	/**
	 * Returns the date given the match of this regex.
	 * Returns undefined if match is not valid.
	 */
	date: (match: RegExpMatchArray) => Temporal.PlainDateTime | undefined;
};

export const dateMatchers: DateMatcher[] = [
	{
		// Tonight
		match: /tonight/i,
		priority: 10,
		date: () => {
			const today = Temporal.Now.plainDateTimeISO();
			return new Temporal.PlainDateTime(today.year, today.month, today.day, 23, 59);
		}
	},
	{
		// Next week
		match: /next week/i,
		priority: 10,
		date: () => {
			const nextWeek = Temporal.Now.plainDateTimeISO().add({ weeks: 1 });
			return new Temporal.PlainDateTime(nextWeek.year, nextWeek.month, nextWeek.day, 23, 59);
		}
	},
	{
		// Tomorrow (at time)
		match: /(tomorrow|tmrw)(( at| @)? (1[0-2]|0?\d|[2][0-3])((:([0-5]\d) ?(am|pm)?)|(am|pm)))?/i,
		priority: 10,
		date: match => {
			const today = Temporal.Now.plainDateTimeISO();
			const tomorrow = today.add({ days: 1 });
			// match[2] is time, if there isn't a time, default to tomorrow at 11:59pm
			if (!match[2])
				return new Temporal.PlainDateTime(tomorrow.year, tomorrow.month, tomorrow.day, 23, 59);

			let hour = parseInt(match[4]);
			const minute = parseInt(match[7]);
			const ampm = match[9] ?? match[8];

			// If there isn't an hour or (minute and ampm are invalid)
			if (Number.isNaN(hour) || (Number.isNaN(minute) && !ampm))
				return undefined;

			if (ampm && hour > 12)
				return undefined;

			if (ampm === "pm" && hour !== 12)
				hour += 12;

			return new Temporal.PlainDateTime(tomorrow.year, tomorrow.month, tomorrow.day, hour, minute);
		}
	},
	{
		// (in)? (time) (time unit)s (ago)?
		// in 5 days, 3 weeks ago, etc.
		// Time defaults to 11:59pm
		match: /(in )?(\d) ?(week|w|day|d|hour|h|minute|m)s?( |$)(ago)?/i,
		priority: 15,
		date: match => {
			const time = match[2];
			const unit = match[3];
			const isPast = match[5];

			const timeNum = parseInt(time);
			if (Number.isNaN(timeNum))
				return;

			const timeOfUnit = unitTime[unit as keyof typeof unitTime];
			if (!timeOfUnit)
				return;

			const totalDeltaTime = timeNum * timeOfUnit;
			const date = Temporal.Now.plainDateTimeISO().add({ milliseconds: (isPast ? -totalDeltaTime : totalDeltaTime) });
			return new Temporal.PlainDateTime(date.year, date.month, date.day, 23, 59);
		}
	},
	{
		// Matches date (and time)
		// MM/DD(/YYYY) (at/@) (HH(:MM) (AM/PM))
		// If no year, defaults to this year, or next year if the date as already passed
		// If no time, defaults to 11:59pm
		match: /(0?[1-9]|1[0-2])(-|\.|\\|\/)(3[01]|[12][0-9]|0?[1-9])(-|\.|\\|\/)?((20|19)(\d{2}))?(( at| @)? (1[0-2]|0?\d|[2][0-3])((:([0-5]\d) ?(am|pm)?)|(am|pm)))?/i,
		priority: 8,
		date: match => {
			const today = Temporal.Now.plainDateTimeISO();

			const month = parseInt(match[1]);
			const day = parseInt(match[3]);
			let year = match[5] ? parseInt(match[5]) : null;
			// If no hour is present, it must be only a date, then default to 11:59
			let hour = parseInt(match[10] ?? "23");
			const minute = parseInt(match[13] ?? (Number.isNaN(parseInt(match[10])) ? "59" : "0"));
			const ampm = match[15] ?? match[14];

			if ([month, day, hour, minute].map(Number.isNaN).filter(b => !!b).length > 0)
				return undefined;

			// If no specified year, check if the date this year has passed, if so, use next year, otherwise, it's this year
			if (!year) {
				if (new Temporal.PlainDateTime(today.year, month, day).since(today).total("millisecond") < 0)
					year = today.year + 1;
				else
					year = today.year;
			}

			if (ampm && hour > 12)
				return undefined;

			if (ampm === "pm" && hour !== 12)
				hour += 12;

			return new Temporal.PlainDateTime(year, month, day, hour, minute);
		}
	},
	{
		// Matches just time, since editing the one above to match either date, time, or date/time would be very hard
		// 11:59(am/pm), 11am
		match: /(1[0-2]|0?\d|[2][0-3])((:([0-5]\d) ?(am|pm)?)|(am|pm))/i,
		priority: 7,
		date: match => {
			let hour = parseInt(match[1]);
			const minute = parseInt(match[4] ?? "0");
			const ampm = match[5] ?? match[6];

			// If there isn't an hour or (minute and ampm are invalid)
			if (Number.isNaN(hour) || (Number.isNaN(minute) && !ampm))
				return undefined;

			if (ampm && hour > 12)
				return undefined;

			if (ampm === "pm" && hour !== 12)
				hour += 12;

			const today = Temporal.Now.plainDateTimeISO();
			let res = new Temporal.PlainDateTime(today.year, today.month, today.day, hour, minute);

			// If res is in past, add a day
			if (res.since(today).total("millisecond") < 0)
				res = res.add({ days: 1 });

			return res;
		}
	}
];

/**
 * Uses many relative date matchers to find a date in an arbirtrary string.
 * @param str The string to search.
 * @returns A date if found, null otherwise.
 */
export function findDate(str: string): Temporal.PlainDateTime | null {
	for (const matcher of [...dateMatchers].sort((a, b) => b.priority - a.priority)) {
		const match = matcher.match.exec(str);
		if (!match)
			continue;

		const res = matcher.date(match);
		if (!res)
			continue;

		return res;
	}

	return null;
}

/**
 * Same as `findDate`, but returns the match instead of the date.
 * @param str The string to search.
 * @returns A RegExpMatchArray if found, null otherwise.
 */
export function findDateMatch(str: string): RegExpMatchArray | null {
	for (const matcher of [...dateMatchers].sort((a, b) => b.priority - a.priority)) {
		const match = matcher.match.exec(str);
		if (!match)
			continue;
		return match;
	}

	return null;
}

/**
 * Sorts tasks by name, due date, and completion.
 * @param tasks The tasks to sort.
 * @returns Sorted list of tasks.
 */
export function sortTasks(tasks: Task[]) {
	const now = new Date();
	return tasks
		// Sort by name
		.sort((a, b) => a.title.localeCompare(b.title))
		// Then by due date
		.sort((a, b) => (a.dueDate ?? now.getTime()) - (b.dueDate ?? now.getTime()))
		// Then completed tasks to the bottom
		.sort((a, b) => a.complete === b.complete ? 0 : a.complete ? 1 : -1);
}

export function taskToCalendar(data: NeptuneData, user: User, task: Task): CalendarEvent | null {
	if (!task.dueDate)
		return null;

	const course = data.courses.find(c => c.id === task.courseId);
	const color = course?.color ?? user.icalColor;

	const dueDate = epochToTemporal(task.dueDate);

	return {
		id: `task-${task.id}${task.complete ? "-COMPLETE" : ""}`,
		title: task.title,
		color: getDimmedColor(color),
		borderColor: color,
		allDay: true,
		start: dueDate.toString(),
	};
}
