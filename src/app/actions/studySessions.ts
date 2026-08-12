"use server";

import { and,eq } from "drizzle-orm";

import { db, studySessionsTable } from "@/db/schema";
import { StudySession, StudySessionInsert } from "@/db/types";

import { actionError, ActionRes, authenticate } from ".";

export async function getStudySessions(): ActionRes<StudySession[]> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	if (process.env.IS_DEMO === "true")
		return [];

	return await db.select().from(studySessionsTable)
		.where(eq(studySessionsTable.userId, user.id!))
		.catch(e => { throw actionError("Could not fetch study sessions", e); });
}

export async function createStudySession(data: StudySessionInsert): ActionRes<StudySession> {
	const user = await authenticate();

	if (!user || !user.id)
		throw actionError("Not authenticated.");

	delete data.id;

	if (process.env.IS_DEMO === "true")
		// @ts-expect-error It's the demo it doesn't matter
		return { id: randomUUID(), userId: "0", ...data };

	const res = await db.insert(studySessionsTable).values({
		...data,
		userId: user.id!
	}).returning().catch(e => { throw actionError("Could not create study session", e); });

	return res[0];
}

export async function editStudySession(data: Partial<StudySession> & { id: string }): ActionRes<StudySession> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const studySession = (
		await db.select().from(studySessionsTable)
		.where(and(eq(studySessionsTable.userId, user.id!), eq(studySessionsTable.id, data.id)))
			.catch(e => { throw actionError("Could not find study session", e); })
	)[0];

	if (!studySession)
		throw actionError("Could not find study session", `could not find study session id: ${data.id}`);

	if (process.env.IS_DEMO === "true")
		return { ...studySession, ...data };

	const res = (
		await db.update(studySessionsTable).set(data)
			.where(and(eq(studySessionsTable.userId, user.id!), eq(studySessionsTable.id, data.id)))
			.returning()
			.catch(e => { throw actionError("Could not edit study session", e); })
	)[0];

	return res;
}

export async function deleteStudySession(id: string): ActionRes<void> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	if (process.env.IS_DEMO === "true")
		return;

	const studySession = (
		await db.select().from(studySessionsTable)
		.where(and(eq(studySessionsTable.userId, user.id!), eq(studySessionsTable.id, id)))
			.catch(e => { throw actionError("Could not find study session", e); })
	)[0];

	if (!studySession)
		throw actionError("Could not find study session", `could not find study session id: ${id}`);

	await db.delete(studySessionsTable).where(eq(studySessionsTable.id, id));
}
