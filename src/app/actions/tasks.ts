"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

import { db, tasksTable } from "@/db/schema";
import { Task, TaskInsert } from "@/db/types";

import { actionError, ActionRes, authenticate } from ".";

export async function getTasks(): ActionRes<Task[]> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	if (process.env.IS_DEMO === "true")
		return [];

	return await db.select().from(tasksTable)
		.where(eq(tasksTable.userId, user.id!))
		.catch(e => { throw actionError("Could not fetch tasks", e); });
}

export async function createTask(data: TaskInsert): ActionRes<Task> {
	const user = await authenticate();

	if (!user || !user.id)
		throw actionError("Not authenticated.");

	delete data.id;

	if (process.env.IS_DEMO === "true")
		// @ts-expect-error It's the demo it doesn't matter
		return { id: randomUUID(), userId: "0", ...data };

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

	const task = (
		await db.select().from(tasksTable)
		.where(and(eq(tasksTable.userId, user.id!), eq(tasksTable.id, data.id)))
			.catch(e => { throw actionError("Could not find task", e); })
	)[0];

	if (!task)
		throw actionError("Could not find task", `could not find task id: ${data.id}`);

	if (process.env.IS_DEMO === "true")
		return { ...task, ...data };

	const res = (
		await db.update(tasksTable).set(data)
			.where(and(eq(tasksTable.userId, user.id!), eq(tasksTable.id, data.id)))
			.returning()
			.catch(e => { throw actionError("Could not edit task", e); })
	)[0];

	return res;
}

export async function deleteTask(id: string): ActionRes<void> {
	const user = await authenticate();

	if (!user)
		throw actionError("Not authenticated.");

	if (process.env.IS_DEMO === "true")
		return;

	const task = (
		await db.select().from(tasksTable)
		.where(and(eq(tasksTable.userId, user.id!), eq(tasksTable.id, id)))
			.catch(e => { throw actionError("Could not find task", e); })
	)[0];

	if (!task)
		throw actionError("Could not find task", `could not find task id: ${id}`);

	await db.delete(tasksTable).where(eq(tasksTable.id, id));
}
