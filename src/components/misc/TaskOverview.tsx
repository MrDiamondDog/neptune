import { Popover, PopoverTrigger } from "@radix-ui/react-popover";

import { Task } from "@/db/types";
import { epochToTemporal, WEEKS } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import { PopoverContent } from "../primitives/Popover";
import TaskPopover from "../tasks/TaskPopover";
import NodeList from "./NodeList";

export function TaskTitle({ task }: { task: Task }) {
	const { courses } = useApp();
	const course = courses.find(c => c.id === task.courseId);

	return <Popover>
		<PopoverTrigger asChild>
			<span className="cursor-pointer underline" style={{ color: course ? course.color : "var(--color-primary)" }}>
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

	const today = Temporal.Now.plainDateTimeISO();
	const now = Temporal.Now.instant();
	const tomorrow = today.add({ days: 1 });

	function getTasksOnDay(day: Temporal.PlainDateTime) {
		return tasks.filter(t =>
			!t.complete &&
			t.dueDate &&
			epochToTemporal(t.dueDate).round({ roundingMode: "floor", smallestUnit: "day" }).equals(day.round({ roundingMode: "floor", smallestUnit: "day" }))
		);
	}

	const tasksToday = getTasksOnDay(today);
	const tasksUpcoming = [...getTasksOnDay(tomorrow), ...getTasksOnDay(tomorrow.add({ days: 1 }))];
	const tasksThisWeek = tasks.filter(t => !t.complete && t.dueDate && t.dueDate - now.epochMilliseconds < WEEKS);

	if (tasksToday.length)
		return <p>Tonight, you need to finish <NodeList nodes={tasksToday.map(t => <TaskTitle task={t} key={t.id} />)} />. {!!tasksUpcoming.length && `You have ${tasksUpcoming.length} other tasks to work on due soon.`}</p>;
	else if (tasksUpcoming.length)
		return <p>You have nothing due tonight! You should start working on <NodeList nodes={tasksUpcoming.map(t => <TaskTitle task={t} key={t.id} />)} />.</p>;
	else if (!tasksToday.length && !tasksUpcoming.length)
		return <p>You have no tasks you need to complete soon! {!!tasksThisWeek.length && `You should consider working on the ${tasksThisWeek.length} tasks due in the next week.`}</p>;

	return null;
}
