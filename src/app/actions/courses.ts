"use server";

import { coursesTable, db, usersTable } from "@/db/schema";
import { actionError, authenticate } from ".";
import { eq } from "drizzle-orm";

export async function getCourses() {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	return await db.select().from(coursesTable)
		.where(eq(coursesTable.userId, user.id!))
}
