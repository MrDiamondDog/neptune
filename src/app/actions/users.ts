"use server";

import { eq } from "drizzle-orm";
import ical, { VEvent } from "node-ical";

import { CalendarEvent } from "@/components/calendars/Calendar";
import { db, usersTable } from "@/db/schema";
import { User } from "@/db/types";

import { actionError, ActionRes, authenticate } from ".";

export async function getUser(): ActionRes<User> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	return (await db.select().from(usersTable).where(eq(usersTable.id, user.id!)))[0];
}

export async function getCalendarEvents(): ActionRes<CalendarEvent[]> {
	// export async function getCalendarEvents(): ActionRes<(CalendarEvent | RecurringEvent)[]> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const dbUser = await getUser();

	if (!dbUser || !dbUser.icalUrl)
		return [];

	// Returns an array to handle recurring events
	function convertIcalEvent(event: VEvent): CalendarEvent[] {
		if (event.rrule)
			// Expand recurring events +/- 10 years
			// This doesn't expand them to recur for 10 years, it's just the boundaries
			return ical.expandRecurringEvent(event, {
				from: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365 * 10),
				to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 10),
			}).map(instance => ({
				id: `ical-${event.uid}`,
				title: instance.summary.toString(),
				allDay: instance.isFullDay,
				start: instance.start,
				end: instance.end,
				color: "#2aa841"
			}));

		return [{
			id: `ical-${event.uid}`,
			title: event.summary.toString(),
			allDay: !!event.start.dateOnly,
			start: event.start,
			end: event.end ?? new Date(event.start.getTime() + 1000 * 60 * 60 * 24),
			color: "#2aa841"
		}];
	}

	// Fetches the events from the given URL, filters for only events and converts them using the above function
	const events = await ical.async.fromURL(dbUser.icalUrl).then(res => Object.values(res))
		.then(res => res.filter(r => !!r))
		.then(vals => vals.filter(v => v.type === "VEVENT"));
	return events.map(convertIcalEvent).flat();
}

export async function editUser(newUser: Partial<User>): ActionRes<User> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	if (newUser.id && (newUser.id !== user.id))
		throw actionError("Not authenticated.");

	const edited = (await db.update(usersTable).set({ ...newUser }).where(eq(usersTable.id, user.id!))
		.returning()
		.catch(e => {
			console.log(e);
			throw e;
			// throw actionError("Failed to edit user", e);
		}))[0];

	return edited;
}
