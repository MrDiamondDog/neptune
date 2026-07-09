import { Course } from "@/db/types";

export type CoursesAction =
	{ context: "courses", type: "create", data: Course } |
	{ context: "courses", type: "edit", data: Course } |
	{ context: "courses", type: "delete", id: string } |
	{ context: "courses", type: "set", data: Course[] };

export function coursesReducer(data: Course[], action: CoursesAction): Course[] {
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
