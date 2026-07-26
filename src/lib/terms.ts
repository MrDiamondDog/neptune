import { Term } from "@/db/types";

/**
 * Gets the current term based on the current date.
 * @param terms From `useApp`
 * @returns The current term, or undefined.
 */
export function getCurrentTerm(terms: Term[]) {
	const now = new Date().getTime();

	return terms.find(t => t.start.getTime() < now && t.end.getTime() > now);
}
