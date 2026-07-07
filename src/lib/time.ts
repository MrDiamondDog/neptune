const daysOfWeek = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];

const months = [
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
]

export function prettyTime(date: Date, mode: "24" | "12" = "12") {
	let hours = date.getHours();
	const minutes = date.getMinutes();

	const ampm = hours >= 12 ? "pm" : "am";
	if (hours > 12 && mode === "12") {
		hours -= 12;
	}

	return `${hours}:${minutes < 10 ? "0" : ""}${minutes}${mode === "12" ? ampm : ""}`
}

export function prettyDate(date: Date) {
	return `${daysOfWeek[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${prettyTime(date)}`
}

export function relativeDate(date: Date) {
	const MINUTES = 1000 * 60;
	const HOURS = MINUTES * 60;
	const DAYS = HOURS * 24;

	const now = new Date();

	const relativeTime = Math.abs(date.getTime() - now.getTime());

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

		relativeString = `${inHours} hour${inHours !== 1 ? "s" : ""}`

		if (inHours === 0) {
			const inMinutes = Math.floor(relativeTime / MINUTES);

			relativeString = `${inMinutes} minute${inMinutes !== 1 ? "s" : ""}`

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
