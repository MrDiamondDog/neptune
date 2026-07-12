import { PopoverTrigger } from "@radix-ui/react-popover";
import { Check } from "lucide-react";
import { useRef, useState } from "react";
import Confetti from "react-confetti";

import { editTask } from "@/app/actions/tasks";
import { Task as TaskType } from "@/db/types";
import { hexToRgb } from "@/lib/colors";
import { relativeDate } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import { Popover } from "../primitives/Popover";
import Subtext from "../primitives/Subtext";
import TaskPopover from "./TaskPopover";

export default function Task({ task }: { task: TaskType }) {
	const { courses, dispatch } = useApp();
	const course = courses.find(c => c.id === task.courseId);

	const checkRef = useRef<HTMLDivElement | null>(null);
	const [confettiPos, setConfettiPos] = useState({ x: 0, y: 0, w: 10, h: 10 });
	const [confettiComplete, setConfettiComplete] = useState(task.complete);

	return <Popover>
		<PopoverTrigger asChild>
			<div className="flex gap-2 hover:bg-bg-lighter cursor-pointer pb-1">
				<div className="h-full">
					<div className={`min-w-5 min-h-5 border border-bg-lighter ${task.complete ? "bg-primary" : "bg-bg"} ml-1 mt-1 cursor-pointer flex items-center justify-center`}
						onClick={e => {
							e.stopPropagation();
							dispatch({ context: "tasks", type: "edit", data: { id: task.id, complete: !task.complete } });
							editTask({ id: task.id, complete: !task.complete });
							if (!task.complete) {
								setConfettiComplete(false);
								const box = checkRef.current!.getBoundingClientRect();
								setConfettiPos({ x: box.x, y: box.y, w: 10, h: 10 });
							}
						}}
						ref={checkRef}
					>
						{task.complete && <Check size={16} />}
						{(task.complete && !confettiComplete) && <Confetti
							gravity={.35}
							confettiSource={confettiPos}
							recycle={false}
							tweenDuration={100}
							numberOfPieces={10}
							initialVelocityY={{ min: -5, max: -10 }}
							onConfettiComplete={() => setConfettiComplete(true)}
						/>}
					</div>
				</div>
				<div className="flex flex-col gap-1">
					<p className="w-full">{task.title}</p>
					{task.dueDate && <Subtext>{relativeDate(task.dueDate)}</Subtext>}
					<div className="flex gap-1">
						{task.priority && <div className="text-xs bg-danger-secondary px-1 border border-danger w-fit">{"!".repeat(task.priority)}</div>}
						{course && <div className="text-xs px-1 border w-fit"
							style={{ backgroundColor: `rgba(${Object.values(hexToRgb(course.color)!).join(", ")}, 0.5)`, borderColor: course.color }}
						>
							{course.name}
						</div>}
					</div>
				</div>
			</div>
		</PopoverTrigger>
		<TaskPopover task={task} />
	</Popover>;
}
