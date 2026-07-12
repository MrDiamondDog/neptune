import { Check } from "lucide-react";
import { useState } from "react";

import { deleteTask, editTask } from "@/app/actions/tasks";
import { Task } from "@/db/types";
import { hexToRgb } from "@/lib/colors";
import { prettyDate, relativeDate } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import Button, { ButtonLooks } from "../primitives/Button";
import Divider from "../primitives/Divider";
import Input from "../primitives/Input";
import Link from "../primitives/Link";
import { PopoverContent } from "../primitives/Popover";
import Subtext from "../primitives/Subtext";
import EditTask from "./EditTask";

export default function TaskPopover({ task }: { task: Task }) {
	const { courses, dispatch } = useApp();
	const course = courses.find(c => c.id === task.courseId);

	const [editing, setEditing] = useState(false);
	const [editingUrl, setEditingUrl] = useState(task.link ?? "");
	const [editingNote, setEditingNote] = useState(task.note ?? "");

	function onDelete() {
		deleteTask(task.id);
		dispatch({ context: "tasks", type: "delete", id: task.id });
	}

	function updateOptionalFields() {
		editTask({ id: task.id, link: editingUrl, note: editingNote });
		dispatch({ context: "tasks", type: "edit", data: { id: task.id, link: editingUrl, note: editingNote } });
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
					{course && <div className="text-xs px-1 border w-fit"
						style={{ backgroundColor: `rgba(${Object.values(hexToRgb(course.color)!).join(", ")}, 0.5)`, borderColor: course.color }}
					>
						{course.name}
					</div>}
				</div>
				{task.link && <Link external href={task.link} className="link" target="_blank">{task.link}</Link>}
				{task.note && <p className="whitespace-pre-wrap">{task.note}</p>}
			</div>
		</div>}
		{editing && <>
			<EditTask task={{ ...task, title: task.originalTitle }} onEditEnd={cancelled => {
				setEditing(false);
				if (!cancelled)
					updateOptionalFields();
			}} />

			<div className="flex flex-col gap-1 mt-2 ml-8 *:w-full">
				<Input placeholder="URL" value={editingUrl} onChange={setEditingUrl} className="w-full" />
				<Input placeholder="Note" value={editingNote} onChange={setEditingNote} className="w-full" multiline />
			</div>
		</>}

		{!editing && <>
			<Divider />

			<div className="flex gap-2 w-full">
				<Button look={ButtonLooks.SECONDARY2} className="py-1" onClick={() => setEditing(true)}>Edit</Button>
				<Button look={ButtonLooks.DANGER} className="py-1" onClick={onDelete}>Delete</Button>
			</div>
		</>}
	</PopoverContent>;
}
