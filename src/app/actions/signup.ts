"use server";

import bcrypt from "bcryptjs";

import { db, usersTable } from "@/db/schema";
import { User } from "@/db/types";

export async function signUp(email: string, name: string, password: string, timezone: number): Promise<User> {
	if (process.env.ALLOW_SIGNUPS !== "true" || process.env.IS_DEMO === "true")
		throw "Sign ups are disabled by the adminsistrator of this application.";

	if (password.length < 8)
		throw "Passwords must be longer than 8 characters.";

	const user = (
		await db.insert(usersTable).values({
			email: email,
			password: await bcrypt.hash(password, 10),
			name,
			timezoneOffset: timezone
		})
			.returning()
	)[0];

	return user;
}
