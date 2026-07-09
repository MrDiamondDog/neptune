import { Meeting } from "@/db/types";

export type MeetingsAction =
	{ context: "meetings", type: "create", data: Meeting } |
	{ context: "meetings", type: "edit", data: Meeting } |
	{ context: "meetings", type: "delete", id: string } |
	{ context: "meetings", type: "set", data: Meeting[] };

export function meetingsReducer(data: Meeting[], action: MeetingsAction): Meeting[] {
	switch (action.type) {
		case "create": {
			return [...data, action.data];
		}
		case "edit": {
			return [...data.filter(d => d.id !== action.data.id), action.data];
		}
		case "set": {
			return action.data;
		}
		default: {
			return data;
		}
	}
}
