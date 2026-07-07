"use server";

import { coursesTable, db, meetingsTable, usersTable } from "@/db/schema";
import { actionError, authenticate } from ".";
import { eq, and } from "drizzle-orm";

export async function getMeetings(courseId: string) {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	return await db.select().from(meetingsTable)
		.where(and(eq(meetingsTable.userId, user.id!), eq(meetingsTable.courseId, courseId)))
}
