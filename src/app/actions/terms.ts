"use server";

import { and,eq } from "drizzle-orm";

import { db, termsTable } from "@/db/schema";
import { Term, TermInsert } from "@/db/types";

import { actionError, ActionRes, authenticate } from ".";

export async function getTerms(): ActionRes<Term[]> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	return await db.select().from(termsTable)
		.where(eq(termsTable.userId, user.id!))
		.catch(e => { throw actionError("Could not fetch terms", e); });
}

export async function createTerm(data: TermInsert): ActionRes<Term> {
	const user = await authenticate();

	if (!user || !user.id)
		throw actionError("Not authenticated.");

	delete data.id;

	const res = await db.insert(termsTable).values({
		...data,
		userId: user.id!
	}).returning().catch(e => { throw actionError("Could not create term", e); });

	return res[0];
}

export async function editTerm(data: Partial<Term> & { id: string }): ActionRes<Term> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const term = (
		await db.select().from(termsTable)
		.where(and(eq(termsTable.userId, user.id!), eq(termsTable.id, data.id)))
			.catch(e => { throw actionError("Could not find term", e); })
	)[0];

	if (!term)
		throw actionError("Could not find term", `could not find term id: ${data.id}`);

	const res = (
		await db.update(termsTable).set(data)
			.where(and(eq(termsTable.userId, user.id!), eq(termsTable.id, data.id)))
			.returning()
			.catch(e => { throw actionError("Could not edit term", e); })
	)[0];

	return res;
}

export async function deleteTerm(id: string): ActionRes<void> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const task = (
		await db.select().from(termsTable)
		.where(and(eq(termsTable.userId, user.id!), eq(termsTable.id, id)))
			.catch(e => { throw actionError("Could not find term", e); })
	)[0];

	if (!task)
		throw actionError("Could not find term", `could not find term id: ${id}`);

	await db.delete(termsTable).where(eq(termsTable.id, id));
}
