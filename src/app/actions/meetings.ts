"use server";

import { and,eq } from "drizzle-orm";

import { db, meetingsTable } from "@/db/schema";
import { Meeting, MeetingInsert } from "@/db/types";

import { actionError, ActionRes, authenticate } from ".";

export async function getAllMeetings(): ActionRes<Meeting[]> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	return await db.select().from(meetingsTable)
		.where(and(eq(meetingsTable.userId, user.id!)));
}

export async function getMeetings(courseId: string): ActionRes<Meeting[]> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	return await db.select().from(meetingsTable)
		.where(and(eq(meetingsTable.userId, user.id!), eq(meetingsTable.courseId, courseId)));
}

export async function createMeeting(data: MeetingInsert): ActionRes<Meeting> {
	const user = await authenticate();

	if (!user || !user.id)
		throw actionError("Not authenticated.");

	delete data.id;

	const res = await db.insert(meetingsTable).values({
		...data,
		userId: user.id!
	}).returning().catch(e => { throw actionError("Could not create meeting", e); });

	return res[0];
}

export async function editMeeting(data: Partial<Meeting> & { id: string }): ActionRes<Meeting> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const meeting = (
		await db.select().from(meetingsTable)
		.where(and(eq(meetingsTable.userId, user.id!), eq(meetingsTable.id, data.id)))
			.catch(e => { throw actionError("Could not edit meeting", e); })
	)[0];

	if (!meeting)
		throw actionError("Could not find meeting", `could not find meeting id: ${data.id}`);

	const res = (
		await db.update(meetingsTable).set(data)
			.where(and(eq(meetingsTable.userId, user.id!), eq(meetingsTable.id, data.id)))
			.returning()
			.catch(e => { throw actionError("Could not edit meeting", e); })
	)[0];

	return res;
}

export async function deleteMeeting(id: string): ActionRes<void> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const task = (
		await db.select().from(meetingsTable)
		.where(and(eq(meetingsTable.userId, user.id!), eq(meetingsTable.id, id)))
			.catch(e => { throw actionError("Could not find meeting", e); })
	)[0];

	if (!task)
		throw actionError("Could not find meeting", `could not find meeting id: ${id}`);

	await db.delete(meetingsTable).where(eq(meetingsTable.id, id));
}
