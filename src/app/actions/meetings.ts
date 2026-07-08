"use server";

import { and,eq } from "drizzle-orm";

import { db, meetingsTable } from "@/db/schema";

import { actionError, authenticate } from ".";

export async function getMeetings(courseId: string) {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	return await db.select().from(meetingsTable)
		.where(and(eq(meetingsTable.userId, user.id!), eq(meetingsTable.courseId, courseId)));
}
