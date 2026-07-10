import { Check, X } from "lucide-react";

import { Task, TaskInsert } from "@/db/types";
import { useObjectState } from "@/lib/hooks";
import { relativeDate } from "@/lib/time";
import { findDate } from "@/lib/todo";

import { useApp } from "../context/NeptuneContext";
import Input from "../primitives/Input";
import Subtext from "../primitives/Subtext";

const priorityRegex = /!(\d{1,2})/i;
const courseRegex = /([a-zA-Z]+)-?(\d{1,4})/i;
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/i;


export default function EditTask({ task: defaultTask, onEditEnd, onSubmit }: { task?: Task, onEditEnd?: () => void, onSubmit?: (task: Task) => void }) {
	const [task, setTask] = useObjectState<TaskInsert>(defaultTask ?? {
		title: ""
	});

	const { courses } = useApp();

	function onChange(title: string) {
		const dueDate = findDate(title);

		const priorityMatch = title.match(priorityRegex);
		const priority = priorityMatch ? parseInt(priorityMatch[1]) : undefined;

		const courseMatch = title.match(courseRegex);
		const course = courseMatch && courses.find(c => c.subject.toLowerCase() === courseMatch[1].toLowerCase() && c.number === courseMatch[2]);

		const url = title.match(urlRegex);

		setTask({ title, dueDate, priority, link: url?.[0], courseId: course?.id });
	}

	return <>
		<div className="flex gap-2 w-full">
			<div className="h-full">
				<div className={`min-w-5 min-h-5 border border-bg-lighter ${task?.complete ? "bg-primary" : "bg-bg"} ml-1 mt-1 cursor-pointer`}>
					{task?.complete && <Check />}
				</div>
			</div>
			<div className="flex flex-col gap-1 w-full">
				<Input className="w-full" placeholder="Task" value={task?.title ?? ""} onChange={onChange} autoFocus />
				{task?.dueDate && <Subtext>{relativeDate(task.dueDate)}</Subtext>}
				<div className="flex gap-1">
					{task?.priority && <div className="text-xs bg-danger-secondary px-1 border border-danger w-fit">{"!".repeat(task.priority)}</div>}
					{task?.courseId && <div className="text-xs bg-primary px-1 border border-secondary w-fit">{courses.find(c => c.id === task.courseId)?.name}</div>}
				</div>
			</div>
			<X className="text-gray-400 p-1 box-content hover:bg-bg-lighter cursor-pointer" onClick={onEditEnd} />
		</div>
	</>;
}
