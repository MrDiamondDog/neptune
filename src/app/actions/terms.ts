"use server";

import { eq } from "drizzle-orm";

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
