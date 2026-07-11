"use server";

import { eq } from "drizzle-orm";

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
