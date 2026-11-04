import "temporal-polyfill/global";

export const months = [
	"",
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

export const daysOfWeek = {
	"M": "Mon",
	"T": "Tue",
	"W": "Wed",
	"R": "Thu",
	"F": "Fri",
	"S": "Sat",
	"U": "Sun"
};
export const dayOrder = [..."MTWRFSU"];
export const rruleDaysOfWeek = {
	U: "SU",
	M: "MO",
	T: "TU",
	W: "WE",
	R: "TH",
	F: "FR",
	S: "SA"
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

export function dayOfYear(date: Date) {
    return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
}

export function prettyTimeRange(start: Temporal.PlainDateTime, end: Temporal.PlainDateTime, timeMode: "24" | "12" = "12") {
	let startStr = "";
	let endStr = "";

	if (start.dayOfYear !== end.dayOfYear) {
		// If start/end times are 12:00am, hide them (all day event)
		startStr = prettyDate(start, (start.hour === 0 && start.minute === 0) ? "hide" : timeMode);
		// If it lasts exactly one day, no need to use endStr
		if (end.since(start).total("days") === 1)
			return startStr;
		endStr = prettyDate(end, (end.hour === 0 && end.minute === 0) ? "hide" : timeMode);
	} else {
		startStr = prettyTime(start, timeMode);
		endStr = prettyTime(end, timeMode);
	}

	return `${startStr} - ${endStr}`;
}

export function prettyTime(date: Temporal.PlainDateTime, mode: "24" | "12" = "12") {
	let hours = date.hour;
	const minutes = date.minute;

	const ampm = hours >= 12 ? "pm" : "am";
	if (hours > 12 && mode === "12") {
		hours -= 12;
	}

	if (hours === 0 && mode === "12")
		hours = 12;

	return `${hours}:${minutes < 10 ? "0" : ""}${minutes}${mode === "12" ? ampm : ""}`;
}

export function prettyDate(date: Temporal.PlainDateTime, mode: "24" | "12" | "hide" = "12") {
	const showYear = date.year !== Temporal.Now.plainDateTimeISO().year;
	return `${Object.values(daysOfWeek)[date.dayOfWeek - 1]}, ${months[date.month]} ${date.day}${showYear ? `, ${date.year}` : ""}${mode === "hide" ? "" : ", " + prettyTime(date, mode)}`;
}

/**
 * Converts a date to a relative date string.
 * @param date
 */
export function relativeDate(date: Temporal.PlainDateTime) {
	const today = Temporal.Now.plainDateTimeISO();

	// Add 1 second to prevent floating point precision errors
	const relativeTime = date.since(today).abs().add({ seconds: 1 });

	let relativeString = "";
	let isPast = false;

	if (date.since(today).sign === -1)
		isPast = true;

	// If date is further than 7 days, just return date
	if (relativeTime.total("milliseconds") > DAYS * 7)
		return prettyDate(date);

	const inDays = relativeTime.round({ roundingMode: "floor", smallestUnit: "days" }).total("days");
	relativeString = `${inDays} days`;

	if (inDays === 0) {
		const inHours = relativeTime.round({ roundingMode: "floor", smallestUnit: "hours" }).total("hours");

		relativeString = `${inHours} hour${inHours !== 1 ? "s" : ""}`;

		if (inHours === 0) {
			const inMinutes = relativeTime.round({ roundingMode: "floor", smallestUnit: "minutes" }).total("minutes");

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
	minutes += new Date().getTimezoneOffset();

	const hours = Math.floor(minutes / 60);
	minutes -= hours * 60;

	return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
}

export function getTimezoneOffset(tz: string): number {
  const utcDate = new Date(new Date().toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  return (tzDate.getTime() - utcDate.getTime()) / 6e4;
}

export function prettyDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	seconds -= mins * 60;

	return `${mins}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export function temporalToIcalString(date: Temporal.PlainDateTime): string {
	return `${date.year}${date.month.toString().padStart(2, "0")}${date.day.toString().padStart(2, "0")}T${date.hour.toString().padStart(2, "0")}${date.minute.toString().padStart(2, "0")}${date.second.toString().padStart(2, "0")}`;
}

export function epochToTemporal(ms: number): Temporal.PlainDateTime {
	return Temporal.PlainDateTime.from(Temporal.Instant.fromEpochMilliseconds(ms).toString().replace("Z", ""));
}

export function temporalToEpoch(datetime: Temporal.PlainDateTime): number {
	const sinceEpoch = datetime.since({ year: 1970, month: 1, day: 1 });
	return sinceEpoch.total("milliseconds");
}
