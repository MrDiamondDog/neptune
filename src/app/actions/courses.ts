"use server";

import { eq } from "drizzle-orm";

import { coursesTable, db } from "@/db/schema";
import { Course, CourseInsert } from "@/db/types";

import { actionError, ActionRes, authenticate } from ".";

export async function getCourses(): ActionRes<Course[]> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	return await db.select().from(coursesTable)
		.where(eq(coursesTable.userId, user.id!))
		.catch(e => { throw actionError("Could not fetch courses", e); });
}

export async function createCourse(data: CourseInsert): ActionRes<Course> {
	const user = await authenticate();

	if (!user || !user.id)
		throw actionError("Not authenticated.");

	delete data.id;

	const res = await db.insert(coursesTable).values({
		...data,
		userId: user.id!
	}).returning().catch(e => { throw actionError("Could not create course", e); });

	return res[0];
}
