import { Check } from "lucide-react";

import { Task } from "@/db/types";
import { prettyDate, relativeDate } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import Link from "../primitives/Link";
import { PopoverContent } from "../primitives/Popover";
import Subtext from "../primitives/Subtext";

export default function TaskPopover({ task }: { task: Task }) {
	const { courses, dispatch } = useApp();

	return <PopoverContent side="right" className="border-2 border-bg-lighter">
		<div className="flex gap-2">
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
			</div>
		</div>
	</PopoverContent>;
}
