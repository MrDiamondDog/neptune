import { Term } from "@/db/types";

/**
 * Gets the current term based on the current date.
 * @param terms From `useApp`
 * @returns The current term, or undefined.
 */
export function getCurrentTerm(terms: Term[]): Term | null {
	const now = new Date().getTime();

	return terms.find(t => t.start < now && t.end > now) ?? null;
}
