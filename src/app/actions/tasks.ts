"use server";

import { and, eq } from "drizzle-orm";

import { db, tasksTable } from "@/db/schema";
import { Task, TaskInsert } from "@/db/types";

import { actionError, ActionRes, authenticate } from ".";

export async function getTasks(): ActionRes<Task[]> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	return await db.select().from(tasksTable)
		.where(eq(tasksTable.userId, user.id!))
		.catch(e => { throw actionError("Could not fetch tasks", e); });
}

export async function createTask(data: TaskInsert): ActionRes<Task> {
	const user = await authenticate();

	if (!user || !user.id)
		throw actionError("Not authenticated.");

	delete data.id;

	const res = await db.insert(tasksTable).values({
		...data,
		userId: user.id!
	}).returning().catch(e => { throw actionError("Could not create task", e); });

	return res[0];
}

export async function editTask(data: Partial<Task> & { id: string }): ActionRes<Task> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	const meeting = (
		await db.select().from(tasksTable)
		.where(and(eq(tasksTable.userId, user.id!), eq(tasksTable.id, data.id)))
			.catch(e => { throw actionError("Could not edit task", e); })
	)[0];

	if (!meeting)
		throw actionError("Could not find task", `could not find task id: ${data.id}`);

	const res = (
		await db.update(tasksTable).set(data)
			.where(and(eq(tasksTable.userId, user.id!), eq(tasksTable.id, data.id)))
			.returning()
			.catch(e => { throw actionError("Could not edit task", e); })
	)[0];

	return res;
}
