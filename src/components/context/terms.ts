import { Term } from "@/db/types";

export type TermsAction =
	{ context: "terms", type: "create", data: Term } |
	{ context: "terms", type: "edit", data: Term } |
	{ context: "terms", type: "delete", id: string } |
	{ context: "terms", type: "set", data: Term[] };

export function termsReducer(data: Term[], action: TermsAction): Term[] {
	switch (action.type) {
		case "create": {
			return [...data, action.data];
		}
		case "set": {
			return action.data;
		}
		default: {
			return data;
		}
	}
}
