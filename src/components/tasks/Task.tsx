import { PopoverTrigger } from "@radix-ui/react-popover";
import { Check, Dot } from "lucide-react";
import { useRef, useState } from "react";
import Confetti from "react-confetti";

import { editTask } from "@/app/actions/tasks";
import { Task as TaskType } from "@/db/types";
import { useDevice } from "@/lib/hooks";
import { DAYS, epochToTemporal, relativeDate } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import { Popover, PopoverContent } from "../primitives/Popover";
import Portal from "../primitives/Portal";
import Subtext from "../primitives/Subtext";
import TaskPopover from "./TaskPopover";

export default function Task({ task }: { task: TaskType }) {
	const { courses, dispatch } = useApp();
	const [isMobile] = useDevice();
	const course = courses.find(c => c.id === task.courseId);

	const checkRef = useRef<HTMLDivElement | null>(null);
	const [confettiPos, setConfettiPos] = useState({ x: 0, y: 0, w: 10, h: 10 });
	const [confettiComplete, setConfettiComplete] = useState(!!task.complete);

	return <Popover>
		<PopoverTrigger asChild>
			<div className="flex gap-2 hover:bg-bg-lighter cursor-pointer pb-1 pr-2">
				<div className="h-full">
					<div className={`min-w-5 min-h-5 border border-bg-lighter ${task.complete ? "bg-primary" : "bg-bg"} ml-1 mt-1 cursor-pointer flex items-center justify-center`}
						onClick={e => {
							e.stopPropagation();
							dispatch({ context: "tasks", type: "edit", data: { id: task.id, complete: task.complete ? null : Temporal.Now.instant().epochMilliseconds } });
							editTask({ id: task.id, complete: task.complete ? null : Temporal.Now.instant().epochMilliseconds });
							if (!task.complete) {
								setConfettiComplete(false);
								const box = checkRef.current!.getBoundingClientRect();
								setConfettiPos({ x: box.x, y: box.y, w: 10, h: 10 });
							}
						}}
						ref={checkRef}
					>
						{task.complete && <Check size={16} />}
						{(task.complete && !confettiComplete) && <Portal>
							<Confetti
								gravity={.35}
								confettiSource={confettiPos}
								recycle={false}
								tweenDuration={100}
								numberOfPieces={10}
								initialVelocityY={{ min: -5, max: -10 }}
								onConfettiComplete={() => setConfettiComplete(true)}
							/>
						</Portal>}
					</div>
				</div>
				<div className="flex flex-col gap-1 w-full overflow-hidden">
					<p className="w-full overflow-hidden text-ellipsis text-nowrap">{task.title}</p>
					<div className="flex items-center *:text-nowrap">
						{task.dueDate && <Subtext
							className={(task.dueDate - Temporal.Now.instant().epochMilliseconds < DAYS && !task.complete) ? "text-red-500" : ""}
						>
							{relativeDate(epochToTemporal(task.dueDate))}
						</Subtext>}
						{(task.dueDate && task.courseId) && <Dot className="text-gray-500" size={16} />}
						{course && <div className="text-sm underline text-nowrap text-ellipsis overflow-hidden"
							style={{ color: course.color }}
						>
							{course.name}
						</div>}
					</div>
				</div>
			</div>
		</PopoverTrigger>
		<PopoverContent side={isMobile ? "bottom" : "right"} className="border-2 border-bg-lighter">
			<TaskPopover task={task} />
		</PopoverContent>
	</Popover>;
}
