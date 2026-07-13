import { Term } from "@/db/types";

export function getCurrentTerm(terms: Term[]) {
	const now = new Date().getTime();

	return terms.find(t => t.start.getTime() < now && t.end.getTime() > now);
}
