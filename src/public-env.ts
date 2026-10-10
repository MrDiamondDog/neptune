import { createPublicEnv } from "next-public-env";

export const { getPublicEnv, PublicEnv } = createPublicEnv({
	NODE_ENV: process.env.NODE_ENV,
	ALLOW_SIGNUPS: process.env.ALLOW_SIGNUPS ?? "false",
	AUTH_URL: process.env.AUTH_URL ?? "http://localhost:3000",
	IS_DEMO: (process.env.IS_DEMO ?? "false") === "true",
	ALLOW_NOTIFICATIONS: (process.env.ALLOW_NOTIFICATIONS ?? "false") === "true",
	VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY!,
});
