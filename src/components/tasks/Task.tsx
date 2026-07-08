import { Check } from "lucide-react";
import { useState } from "react";

import { Task as TaskType } from "@/db/types";
import { relativeDate } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import Subtext from "../primitives/Subtext";
import TaskModal from "./TaskModal";

export default function Task({ task }: { task: TaskType }) {
	const { courses } = useApp();
	const [openModal, setOpenModal] = useState("");

	return <>
		<div className="flex gap-2 hover:bg-bg-lighter cursor-pointer" onClick={() => setOpenModal("task")}>
			<div className="h-full">
				<div className={`min-w-5 min-h-5 border border-bg-lighter ${task.complete ? "bg-primary" : "bg-bg"} ml-1 mt-1 cursor-pointer`}>
					{task.complete && <Check />}
				</div>
			</div>
			<div className="flex flex-col gap-1">
				<p className="w-full">{task.title}</p>
				{task.dueDate && <Subtext>{relativeDate(task.dueDate)}</Subtext>}
				<div className="flex gap-1">
					{task.priority && <div className="text-xs bg-danger-secondary px-1 border border-danger w-fit">{"!".repeat(task.priority)}</div>}
					{task.courseId && <div className="text-xs bg-primary px-1 border border-secondary w-fit">{courses.find(c => c.id === task.courseId)?.name}</div>}
				</div>
			</div>
		</div>

		<TaskModal task={task} open={openModal === "task"} onClose={() => setOpenModal("")} />
	</>;
}
