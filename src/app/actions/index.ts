import { User } from "next-auth";

import { auth } from "@/auth";

export type ActionRes<T> = Promise<T>;

export async function authenticate(): Promise<User | null> {
	if (process.env.IS_DEMO === "true")
		return { id: "0" };

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
