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
		case "edit": {
			return [...data.filter(t => t.id !== action.data.id), { ...data.find(t => t.id === action.data.id), ...action.data } as Course];
		}
		case "set": {
			return action.data;
		}
		case "delete": {
			return data.filter(t => t.id !== action.id);
		}
		default: {
			return data;
		}
	}
}
