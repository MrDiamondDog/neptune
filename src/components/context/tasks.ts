import { Task } from "@/db/types";

export type TasksAction =
	{ context: "tasks", type: "create", data: Task } |
	{ context: "tasks", type: "edit", data: Task } |
	{ context: "tasks", type: "delete", id: string } |
	{ context: "tasks", type: "set", data: Task[] };

export function tasksReducer(data: Task[], action: TasksAction): Task[] {
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
