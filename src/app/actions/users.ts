"use server";

import { eq } from "drizzle-orm";
import ical, { VEvent } from "node-ical";

import { CalendarEvent } from "@/components/calendars/Calendar";
import { db, usersTable } from "@/db/schema";
import { User } from "@/db/types";
import { DAYS, getTimezoneOffset, HOURS, inDST, MINUTES, YEARS } from "@/lib/time";

import { actionError, ActionRes, authenticate } from ".";

export async function getUser(): ActionRes<User | undefined> {
	if (process.env.IS_DEMO === "true")
		return {
			id: "0",
			email: "demo@neptune-demo.drewrat.dev",
			name: "Demo User",
			timezoneOffset: 0,
			icalUrl: "",
			icalColor: "#00ffff"
		};

	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	// Everything but password field
	const res = (await db.select({
		email: usersTable.email,
		name: usersTable.name,
		timezoneOffset: usersTable.timezoneOffset,
		icalUrl: usersTable.icalUrl,
		icalColor: usersTable.icalColor
	}).from(usersTable).where(eq(usersTable.id, user.id!)))[0] as User | undefined;

	return res;
}

export async function getCalendarEvents(): ActionRes<CalendarEvent[]> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	if (process.env.IS_DEMO === "true")
		return [];

	const dbUser = await getUser();

	if (!dbUser || !dbUser.icalUrl)
		return [];

	const calendar = await ical.async.fromURL(dbUser.icalUrl);

	if (!calendar)
		return [];

	const timezone = calendar.vcalendar?.["WR-TIMEZONE"] ?? "UTC";
	process.env.TZ = timezone;
	const timezoneOffset = getTimezoneOffset(timezone);

	// Returns an array to handle recurring events
	function convertIcalEvent(event: VEvent): CalendarEvent[] {
		// The stupidest workaround imo
		const dst = inDST(event.start) ? 0 : -1 * HOURS;
		const offsetTime = (t: Date) => new Date(t.getTime() + timezoneOffset * MINUTES + dst);

		if (event.rrule)
			// Expand recurring events +/- 10 years
			// This doesn't expand them to recur for 10 years, it's just the boundaries
			return ical.expandRecurringEvent(event, {
				from: new Date(new Date().getTime() - YEARS * 10),
				to: new Date(new Date().getTime() + YEARS * 10),
			}).map((instance, i) => ({
				id: `ical-${event.uid}-${i}`,
				title: instance.summary.toString(),
				allDay: !!event.start.dateOnly,
				start: event.start.dateOnly ? instance.start : offsetTime(instance.start),
				end: event.start.dateOnly ? instance.end : offsetTime(instance.end ?? new Date(instance.start.getTime() + 1 * DAYS)),
				color: dbUser!.icalColor,
			}));

		return [{
			id: `ical-${event.uid}`,
			title: event.summary.toString(),
			allDay: !!event.start.dateOnly,
			start: event.start.dateOnly ? event.start : offsetTime(event.start),
			end: event.start.dateOnly ? event.end : offsetTime(event.end ?? new Date(event.start.getTime() + 1 * DAYS)),
			color: dbUser!.icalColor,
		}];
	}

	// Fetches the events from the given URL, filters for only events and converts them using the above function
	const events = Object.values(calendar)
		.filter(r => !!r)
		.filter(v => v.type === "VEVENT");
	return events.map(convertIcalEvent).flat();
}

export async function editUser(newUser: Partial<User>): ActionRes<User> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	if (process.env.IS_DEMO === "true")
		throw actionError("You can not edit settings in the demo.");

	if (newUser.id && (newUser.id !== user.id))
		throw actionError("Not authenticated.");

	const edited = (await db.update(usersTable).set({ ...newUser }).where(eq(usersTable.id, user.id!))
		.returning()
		.catch(e => {
			console.log(e);
			throw e;
			// throw actionError("Failed to edit user", e);
		}))[0] as User;

	delete edited.password;

	return edited;
}
