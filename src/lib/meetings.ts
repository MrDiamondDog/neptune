/**
 * Sorts a days-of-the-week string by order of days of the week.
 * Ex. "WM" (Wednesday Monday) => "MW" (Monday Wednesday)
 * Defaults to UMTWRFS order.
 */
export function sortDaysOfWeek(days: string): string {
	const order = [..."UMTWRFS"];

	return [...days].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join("");
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
 * Converts minute of day into time of day, 12-hour format.
 */
export function minutesToTime(mins: number): string {
	let hours = Math.floor(mins / 60);
	const minutes = mins - hours * 60;

	const ampm = hours >= 12 ? "pm" : "am";
	if (hours > 12) {
		hours -= 12;
	}

	return `${hours}:${minutes < 10 ? "0" : ""}${minutes}${ampm}`
}

/**
 * Gets the current day of the week as a single letter abbriviation.
 */
export function getDayOfWeekAbbr(): string {
	const order = [..."UMTWRFS"];
	return order[new Date().getDay()];
}
