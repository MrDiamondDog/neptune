import { Check, Save, X } from "lucide-react";
import { toast } from "sonner";

import { createTask, editTask } from "@/app/actions/tasks";
import { Task, TaskInsert } from "@/db/types";
import { getDimmedColor } from "@/lib/colors";
import { throwToast } from "@/lib/errors";
import { useObjectState } from "@/lib/hooks";
import { findDate, findDateMatch } from "@/lib/tasks";
import { relativeDate } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import Input from "../primitives/Input";
import Subtext from "../primitives/Subtext";

const priorityRegex = /!(\d{1,2})/i;
const courseRegex = /([a-zA-Z]+)-?(\d{1,4})/ig;
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/i;

export default function EditTask({ task: defaultTask, onEditEnd }: { task?: Task, onEditEnd?: (cancelled: boolean) => void }) {
	const [task, setTask] = useObjectState<TaskInsert>(defaultTask ?? {
		title: "",
		originalTitle: "",
	});

	const { courses, dispatch } = useApp();
	const course = courses.find(c => c.id === task.courseId);

	// Uses a bunch of regex expressions to find due date, priority, course, or URL fields, then updates the task with those fields.
	function updateTaskFields(title: string) {
		const dueDate = findDate(title);

		const priorityMatch = title.match(priorityRegex);
		const priority = priorityMatch ? parseInt(priorityMatch[1]) : null;

		const courseMatch = [...title.matchAll(courseRegex)].map(m => [m[1].toLowerCase(), m[2]]);
		const course = courseMatch.length ?
			courses.find(c => courseMatch.find(m => m[0] === c.subject.toLowerCase() && m[1] === c.number))
			: null;

		const url = title.match(urlRegex);

		const newTask: TaskInsert = { ...task, title, dueDate, priority, link: url?.[0] ?? null, courseId: course?.id ?? null };
		setTask(newTask);
		return newTask;
	}

	async function onCreate() {
		const newTask = updateTaskFields(task.title);

		let { title } = newTask;
		const originalTitle = title;

		title = title.replaceAll(new RegExp(priorityRegex, "gi"), "");
		title = title.replaceAll(new RegExp(urlRegex, "gi"), "");

		if (course)
			title = title.replace(new RegExp(`${course.subject}${course.number}`, "i"), "");

		const dateMatch = findDateMatch(title);
		if (dateMatch)
			title = title.replace(dateMatch[0], "");

		title = title.trim();

		if (!title) {
			toast.error("Task must have a title.");
			return;
		}

		if (!defaultTask) {
			const res = await createTask({ ...newTask, title, originalTitle }).catch(e => {
				throw throwToast("Could not create task", e);
			});
			dispatch({ context: "tasks", type: "create", data: res });
		} else {
			const res = await editTask({ ...newTask, id: defaultTask.id, title, originalTitle }).catch(e => {
				throw throwToast("Could not edit task", e);
			});
			dispatch({ context: "tasks", type: "edit", data: res });
		}

		onEditEnd?.(false);
	}

	return <>
		<div className="flex gap-2 w-full">
			<div className="h-full">
				<div className={`min-w-5 min-h-5 border border-bg-lighter ${task.complete ? "bg-primary" : "bg-bg"} ml-1 mt-1 cursor-pointer`}>
					{task.complete && <Check />}
				</div>
			</div>
			<div className="flex flex-col gap-1 w-full">
				<Input className="w-full" placeholder="Task" value={task?.title ?? ""} onChange={updateTaskFields} autoFocus
					onKeyDown={e => e.key === "Enter" && onCreate()} />
				{task?.dueDate && <Subtext>{relativeDate(task.dueDate)}</Subtext>}
				<div className="flex gap-1">
					{task?.priority && <div className="text-xs bg-danger-secondary px-1 border border-danger w-fit">{"!".repeat(task.priority)}</div>}
					{course && <div className="text-xs px-1 border w-fit"
						style={{ backgroundColor: getDimmedColor(course.color), borderColor: course.color }}
					>
						{course.name}
					</div>}
				</div>
			</div>

			<Save className="text-gray-400 p-1 box-content hover:bg-bg-lighter cursor-pointer" onClick={onCreate} />
			<X className="text-gray-400 p-1 box-content hover:bg-bg-lighter cursor-pointer" onClick={() => onEditEnd?.(true)} />
		</div>
	</>;
}
