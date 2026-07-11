import { PopoverTrigger } from "@radix-ui/react-popover";
import { Check } from "lucide-react";

import { Task as TaskType } from "@/db/types";
import { relativeDate } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import { Popover } from "../primitives/Popover";
import Subtext from "../primitives/Subtext";
import TaskPopover from "./TaskPopover";

export default function Task({ task }: { task: TaskType }) {
	const { courses } = useApp();

	return <Popover>
		<PopoverTrigger asChild>
			<div className="flex gap-2 hover:bg-bg-lighter cursor-pointer">
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
		</PopoverTrigger>
		<TaskPopover task={task} />
	</Popover>;
}
