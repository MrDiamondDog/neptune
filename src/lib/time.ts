export const daysOfWeek = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];

export const months = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];

export const MINUTES = 1000 * 60;
export const HOURS = MINUTES * 60;
export const DAYS = HOURS * 24;
export const WEEKS = DAYS * 7;
export const YEARS = WEEKS * 52;

export const unitTime = {
	"m": MINUTES,
	"minute": MINUTES,
	"h": HOURS,
	"hour": HOURS,
	"d": DAYS,
	"day": DAYS,
	"w": WEEKS,
	"week": WEEKS,
};

export function prettyTimeRange(start: Date, end: Date, timeMode: "24" | "12" = "12") {
	let startStr = "";
	let endStr = "";

	if (start.getDate() !== end.getDate()) {
		// If start/end times are 12:00am, hide them (all day event)
		startStr = prettyDate(start, (start.getHours() === 0 && start.getMinutes() === 0) ? "hide" : timeMode);
		// If it lasts exactly one day, no need to use endStr
		if (end.getTime() - start.getTime() === 1000 * 60 * 60 * 24)
			return startStr;
		endStr = prettyDate(end, (end.getHours() === 0 && end.getMinutes() === 0) ? "hide" : timeMode);
	} else {
		startStr = prettyTime(start, timeMode);
		endStr = prettyTime(end, timeMode);
	}

	return `${startStr} - ${endStr}`;
}

export function prettyTime(date: Date, mode: "24" | "12" = "12") {
	let hours = date.getHours();
	const minutes = date.getMinutes();

	const ampm = hours >= 12 ? "pm" : "am";
	if (hours > 12 && mode === "12") {
		hours -= 12;
	}

	if (hours === 0 && mode === "12")
		hours = 12;

	return `${hours}:${minutes < 10 ? "0" : ""}${minutes}${mode === "12" ? ampm : ""}`;
}

export function prettyDate(date: Date, mode: "24" | "12" | "hide" = "12") {
	const showYear = date.getFullYear() !== new Date().getFullYear();
	return `${daysOfWeek[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}${showYear ? `, ${date.getFullYear()}` : ""}${mode === "hide" ? "" : ", " + prettyTime(date, mode)}`;
}

export function relativeDate(date: Date) {
	const now = new Date();

	// Add 1 second to prevent floating point precision errors
	const relativeTime = Math.abs(date.getTime() - now.getTime()) + 1000;

	let relativeString = "";
	let isPast = false;

	if (date.getTime() < now.getTime())
		isPast = true;

	// If date is further than 7 days, just return date
	if (relativeTime > DAYS * 7)
		return prettyDate(date);

	const inDays = Math.floor(relativeTime / DAYS);
	relativeString = `${inDays} days`;

	if (inDays === 0) {
		const inHours = Math.floor(relativeTime / HOURS);

		relativeString = `${inHours} hour${inHours !== 1 ? "s" : ""}`;

		if (inHours === 0) {
			const inMinutes = Math.floor(relativeTime / MINUTES);

			relativeString = `${inMinutes} minute${inMinutes !== 1 ? "s" : ""}`;

			if (inMinutes === 0) {
				return "now";
			}
		}
	}

	if (inDays === 1)
		return isPast ? "yesterday" : "tomorrow";

	if (isPast)
		return `${relativeString} ago`;
	else
		return `in ${relativeString}`;
}

/**
 * Converts a 24-hour time string to the number of minutes into the day it is. ("17:00" = 1020 minutes)
 */
export function timeToMinutes(time: string): number {
	const [hours, minutes] = time.split(":").map(v => parseInt(v));
	return hours * 60 + minutes;
}

/**
 * Converts minutes into a 24-hour time string. (1050 minutes = "17:30")
 */
export function minutesToTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	minutes -= hours * 60;
	return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
}

export function toUTCDate(date: Date): Date {
	return new Date(
		Date.UTC(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			date.getHours(),
			date.getMinutes(),
			date.getSeconds()
		)
	);
}
