import { createPublicEnv } from "next-public-env";

export const { getPublicEnv, PublicEnv } = createPublicEnv({
	NODE_ENV: process.env.NODE_ENV,
	ALLOW_SIGNUPS: process.env.ALLOW_SIGNUPS ?? "false",
	AUTH_URL: process.env.AUTH_URL ?? "http://localhost:3000"
});
