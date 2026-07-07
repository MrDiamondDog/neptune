import { Meeting } from "@/db/types";

export type MeetingsAction =
	{ context: "meetings", type: "create", data: Meeting } |
	{ context: "meetings", type: "edit", data: Meeting } |
	{ context: "meetings", type: "delete", id: string } |
	{ context: "meetings", type: "set", data: Meeting[] };

export function meetingsReducer(data: Meeting[], action: MeetingsAction): Meeting[] {
	return data;
}
