import { Check } from "lucide-react";
import { useState } from "react";

import { deleteTask } from "@/app/actions/tasks";
import { Task } from "@/db/types";
import { prettyDate, relativeDate } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import Button, { ButtonLooks } from "../primitives/Button";
import Divider from "../primitives/Divider";
import Link from "../primitives/Link";
import { PopoverContent } from "../primitives/Popover";
import Subtext from "../primitives/Subtext";
import EditTask from "./EditTask";

export default function TaskPopover({ task }: { task: Task }) {
	const { courses, dispatch } = useApp();

	const [editing, setEditing] = useState(false);

	function onDelete() {
		deleteTask(task.id);
		dispatch({ context: "tasks", type: "delete", id: task.id });
	}

	return <PopoverContent side="right" className="border-2 border-bg-lighter">
		{!editing && <div className="flex gap-2">
			<div className="h-full">
				<div className={`min-w-5 min-h-5 border border-bg-lighter ${task.complete ? "bg-primary" : "bg-bg"} ml-1 mt-1 cursor-pointer`}>
					{task.complete && <Check />}
				</div>
			</div>
			<div className="flex flex-col gap-1">
				<p className="w-full">{task.title}</p>
				{task.dueDate && <Subtext>Due {relativeDate(task.dueDate)} ({prettyDate(task.dueDate)})</Subtext>}
				<div className="flex gap-1">
					{task.priority && <div className="text-xs bg-danger-secondary px-1 border border-danger w-fit">{"!".repeat(task.priority)}</div>}
					{task.courseId && <div className="text-xs bg-primary px-1 border border-secondary w-fit">{courses.find(c => c.id === task.courseId)?.name}</div>}
				</div>
				{task.link && <Link external href={task.link} className="link" target="_blank">{task.link}</Link>}
				{task.note && <p>{task.note}</p>}
			</div>
		</div>}
		{editing && <EditTask task={{ ...task, title: task.originalTitle }} onEditEnd={() => setEditing(false)} />}

		{!editing && <>
			<Divider />

			<div className="flex gap-2 w-full">
				<Button look={ButtonLooks.SECONDARY2} className="py-1" onClick={() => setEditing(true)}>Edit</Button>
				<Button look={ButtonLooks.DANGER} className="py-1" onClick={onDelete}>Delete</Button>
			</div>
		</>}
	</PopoverContent>;
}
