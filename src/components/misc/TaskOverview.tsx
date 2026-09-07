import { Popover, PopoverTrigger } from "@radix-ui/react-popover";

import { Task } from "@/db/types";
import { DAYS, WEEKS } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import { PopoverContent } from "../primitives/Popover";
import TaskPopover from "../tasks/TaskPopover";
import NodeList from "./NodeList";

export function TaskTitle({ task }: { task: Task }) {
	return <Popover>
		<PopoverTrigger asChild>
			<span className="cursor-pointer underline text-primary">
				{task.title}
			</span>
		</PopoverTrigger>
		<PopoverContent side="bottom" className="border border-bg-lighter">
			<TaskPopover task={task} />
		</PopoverContent>
	</Popover>;
}

export default function TaskOverview() {
	const { tasks } = useApp();

	const today = new Date();
	const tomorrow = new Date(today.getTime() + DAYS);

	function getTasksOnDay(day: Date) {
		return tasks.filter(t => !t.complete && t.dueDate && t.dueDate.getFullYear() === day.getFullYear() &&
			t.dueDate.getMonth() === day.getMonth() &&
			t.dueDate.getDate() === day.getDate());
	}

	const tasksToday = getTasksOnDay(today);
	const tasksUpcoming = [...getTasksOnDay(tomorrow), ...getTasksOnDay(new Date(tomorrow.getTime() + DAYS))];
	const tasksThisWeek = tasks.filter(t => !t.complete && t.dueDate && t.dueDate.getTime() - new Date().getTime() < WEEKS);

	if (tasksToday.length)
		return <>Tonight, you need to finish <NodeList nodes={tasksToday.map(t => <TaskTitle task={t} key={t.id} />)} />. {tasksUpcoming.length && `You have ${tasksUpcoming.length} other tasks to work on due soon.`}</>;
	else if (tasksUpcoming.length)
		return <>Nothing due tonight! You should start working on <NodeList nodes={tasksUpcoming.map(t => <TaskTitle task={t} key={t.id} />)} />.</>;
	else if (!tasksToday.length && !tasksUpcoming.length)
		return <>You have no tasks you need to complete soon! {tasksThisWeek.length && `You should consider working on the ${tasksThisWeek.length} tasks due in the next week.`}</>;

	return null;
}
