"use server";

import { and,eq } from "drizzle-orm";

import { db, flashcardsTable } from "@/db/schema";
import { Flashcard, FlashcardInsert } from "@/db/types";

import { actionError, ActionRes, authenticate } from ".";

export async function getFlashcards(): ActionRes<Flashcard[]> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	return await db.select().from(flashcardsTable)
		.where(eq(flashcardsTable.userId, user.id!))
		.catch(e => { throw actionError("Could not fetch flashcards", e); });
}

export async function createFlashcard(data: FlashcardInsert): ActionRes<Flashcard> {
	const user = await authenticate();

	if (!user || !user.id)
		throw actionError("Not authenticated.");

	delete data.id;

	const res = await db.insert(flashcardsTable).values({
		...data,
		userId: user.id!
	}).returning().catch(e => { throw actionError("Could not create flashcard", e); });

	return res[0];
}

export async function editFlashcard(data: Partial<Flashcard> & { id: string }): ActionRes<Flashcard> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const flashcard = (
		await db.select().from(flashcardsTable)
		.where(and(eq(flashcardsTable.userId, user.id!), eq(flashcardsTable.id, data.id)))
			.catch(e => { throw actionError("Could not find flashcard", e); })
	)[0];

	if (!flashcard)
		throw actionError("Could not find flashcard", `could not find flashcard id: ${data.id}`);

	const res = (
		await db.update(flashcardsTable).set(data)
			.where(and(eq(flashcardsTable.userId, user.id!), eq(flashcardsTable.id, data.id)))
			.returning()
			.catch(e => { throw actionError("Could not edit flashcard", e); })
	)[0];

	return res;
}

export async function deleteFlashcard(id: string): ActionRes<void> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const flashcard = (
		await db.select().from(flashcardsTable)
		.where(and(eq(flashcardsTable.userId, user.id!), eq(flashcardsTable.id, id)))
			.catch(e => { throw actionError("Could not find flashcard", e); })
	)[0];

	if (!flashcard)
		throw actionError("Could not find flashcard", `could not find flashcard id: ${id}`);

	await db.delete(flashcardsTable).where(eq(flashcardsTable.id, id));
}
