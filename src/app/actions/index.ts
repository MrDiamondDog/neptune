"use server";

import { auth } from "@/auth";
import { User } from "next-auth";

export type ActionRes<T> = Promise<T>;

export async function authenticate(): Promise<User | null> {
	const session = await auth();

	if (!session || !session.user || !session.user.id)
		return null;

	return session.user!;
}

export async function actionError(errorUser: string, errorInternal?: any) {
	errorInternal && console.error(errorInternal);
	return errorUser;
}
