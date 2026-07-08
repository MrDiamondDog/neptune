"use server";

import { eq } from "drizzle-orm";

import { coursesTable, db } from "@/db/schema";

import { actionError, authenticate } from ".";

export async function getCourses() {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	return await db.select().from(coursesTable)
		.where(eq(coursesTable.userId, user.id!));
}
