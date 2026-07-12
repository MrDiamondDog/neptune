import { Meeting } from "@/db/types";

export type MeetingsAction =
	{ context: "meetings", type: "create", data: Meeting } |
	{ context: "meetings", type: "edit", data: Partial<Meeting> & { id: string } } |
	{ context: "meetings", type: "delete", id: string } |
	{ context: "meetings", type: "set", data: Meeting[] };

export function meetingsReducer(data: Meeting[], action: MeetingsAction): Meeting[] {
	switch (action.type) {
		case "create": {
			return [...data, action.data];
		}
		case "edit": {
			return [...data.filter(t => t.id !== action.data.id), { ...data.find(t => t.id === action.data.id), ...action.data } as Meeting];
		}
		case "set": {
			return action.data;
		}
		default: {
			return data;
		}
	}
}
