"use server";

import { execSync } from "child_process";

export async function getCommit() {
	return execSync("git log --pretty=format:%h -n 1").toString().trim();
}
