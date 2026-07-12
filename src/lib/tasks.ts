import { Task } from "@/db/types";

import { DAYS, unitTime } from "./time";

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
	date: (match: RegExpMatchArray) => Date | undefined;
};

export const dateMatchers: DateMatcher[] = [
	{
		// Tomorrow (at time)
		match: /(tomorrow|tmrw)(( at| @)? (1[0-2]|0?\d|[2][0-3])((:([0-5]\d) ?(am|pm)?)|(am|pm)))?/i,
		priority: 10,
		date: match => {
			// match[2] is time, if there isn't a time, default to tomorrow at 11:59pm
			if (!match[2]) {
				const tomorrow = new Date(new Date().getTime() + 1 * DAYS);
				return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59);
			}

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

			const today = new Date();
			const res = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, hour, minute);

			if (!res.getTime())
				return undefined;

			return res;
		}
	},
	{
		// (in)? (time) (time unit)s (ago)?
		// in 5 days, 3 weeks ago, etc.
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
			return new Date(new Date().getTime() + (isPast ? -totalDeltaTime : totalDeltaTime));
		}
	},
	{
		// Matches date (and time)
		// MM/DD(/YYYY) (at/@) (HH(:MM) (AM/PM))
		// If no year, defaults to this year, or next year if the date as already passed
		// If no time, defaults to 11:59pm
		match: /(0?[1-9]|1[0-2])(-|\.|\\|\/)(0[1-9]|[12][0-9]|3[01])(-|\.|\\|\/)?((20|19)(\d{2}))?(( at| @)? (1[0-2]|0?\d|[2][0-3])((:([0-5]\d) ?(am|pm)?)|(am|pm)))?/i,
		priority: 8,
		date: match => {
			const month = parseInt(match[1]);
			const date = parseInt(match[3]);
			let year = match[5] ? parseInt(match[5]) : null;
			// If no hour is present, it must be only a date, then default to 11:59
			let hour = parseInt(match[10] ?? "23");
			const minute = parseInt(match[13] ?? (Number.isNaN(parseInt(match[10])) ? "59" : "0"));
			const ampm = match[15] ?? match[14];

			if ([month, date, hour, minute].map(Number.isNaN).filter(b => !!b).length > 0)
				return undefined;

			// If no specified year, check if the date this year has passed, if so, use next year, otherwise, it's this year
			if (!year) {
				if (new Date(new Date().getFullYear(), month - 1, date).getTime() < new Date().getTime())
					year = new Date().getFullYear() + 1;
				else
					year = new Date().getFullYear();
			}

			if (ampm && hour > 12)
				return undefined;

			if (ampm === "pm" && hour !== 12)
				hour += 12;

			const res = new Date(year, month - 1, date, hour, minute);

			if (!res.getTime())
				return undefined;

			return res;
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

			const today = new Date();
			let res = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);

			if (!res.getTime())
				return undefined;

			// If res is in past, add a day
			if (new Date().getTime() > res.getTime())
				res = new Date(res.getTime() + 1 * DAYS);

			return res;
		}
	}
];

export function findDate(str: string): Date | undefined {
	for (const matcher of [...dateMatchers].sort((a, b) => b.priority - a.priority)) {
		const match = matcher.match.exec(str);
		if (!match)
			continue;

		const res = matcher.date(match);
		if (!res)
			continue;

		return res;
	}

	return undefined;
}

export function findDateMatch(str: string): RegExpMatchArray | undefined {
	for (const matcher of [...dateMatchers].sort((a, b) => b.priority - a.priority)) {
		const match = matcher.match.exec(str);
		if (!match)
			continue;
		return match;
	}

	return undefined;
}

export function sortTasks(tasks: Task[]) {
	return tasks
		// Sort by name
		.sort((a, b) => a.title.localeCompare(b.title))
		// Then by due date
		.sort((a, b) => (a.dueDate ?? new Date()).getTime() - (b.dueDate ?? new Date()).getTime())
		// Then completed tasks to the bottom
		.sort((a, b) => a.complete === b.complete ? 0 : a.complete ? 1 : -1);
}
