import { User } from "next-auth";

import { auth } from "@/auth";

export type ActionRes<T> = Promise<T>;

export async function authenticate(): Promise<User | null> {
	const session = await auth();

	if (!session || !session.user || !session.user.id)
		return null;

	return session.user!;
}

export function actionError(errorUser: string, errorInternal?: unknown) {
	if (errorInternal)
		console.error(errorInternal);
	return errorUser;
}
