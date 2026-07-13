"use server";

import { and, eq } from "drizzle-orm";

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

export async function editCourse(data: Partial<Course> & { id: string }): ActionRes<Course> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const course = (
		await db.select().from(coursesTable)
		.where(and(eq(coursesTable.userId, user.id!), eq(coursesTable.id, data.id)))
			.catch(e => { throw actionError("Could not find course", e); })
	)[0];

	if (!course)
		throw actionError("Could not find course", `could not find course id: ${data.id}`);

	const res = (
		await db.update(coursesTable).set(data)
			.where(and(eq(coursesTable.userId, user.id!), eq(coursesTable.id, data.id)))
			.returning()
			.catch(e => { throw actionError("Could not edit course", e); })
	)[0];

	return res;
}

export async function deleteCourse(id: string): ActionRes<void> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const task = (
		await db.select().from(coursesTable)
		.where(and(eq(coursesTable.userId, user.id!), eq(coursesTable.id, id)))
			.catch(e => { throw actionError("Could not find course", e); })
	)[0];

	if (!task)
		throw actionError("Could not find course", `could not find course id: ${id}`);

	await db.delete(coursesTable).where(eq(coursesTable.id, id));
}
