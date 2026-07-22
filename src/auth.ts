import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db, usersTable } from "./db/schema";
import { getPublicEnv } from "./public-env";

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: DrizzleAdapter(db),
	providers: [
		Credentials({
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials): Promise<Omit<typeof usersTable.$inferSelect, "password"> | null> => {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const user = (await db.select().from(usersTable)
						.where(eq(usersTable.email, credentials.email as string)))[0];

					if (!user || !user.password) {
						return null;
					}

					const isPasswordValid = await bcrypt.compare(
						credentials.password as string,
						user.password
					);

					if (!isPasswordValid) {
						return null;
					}

					return {
						id: user.id as string,
						email: user.email as string,
						name: user.name as string,
						icalUrl: user.icalUrl,
					};
				} catch (error) {
					console.error("Error during authentication:", error);
					return null;
				}
			},
		}),
	],
	secret: process.env.AUTH_SECRET,
	pages: {
		signIn: "/auth",
	},
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async jwt({ token, user, trigger }) {
			if (trigger === "signUp" && getPublicEnv().ALLOW_SIGNUPS !== "true")
				return null;
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.name = token.name as string;
			}
			return session;
		},
	},
	trustHost: true,
});
