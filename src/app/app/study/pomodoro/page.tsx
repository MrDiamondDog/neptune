"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useApp } from "@/components/context/NeptuneContext";
import Button from "@/components/primitives/Button";
import Divider from "@/components/primitives/Divider";
import Input from "@/components/primitives/Input";
import { ModalFooter } from "@/components/primitives/Modal";
import { SelectMultiple } from "@/components/primitives/Select";
import Subtext from "@/components/primitives/Subtext";
import { Task } from "@/db/types";
import { getDimmedColor } from "@/lib/colors";
import { sortTasks } from "@/lib/tasks";
import { relativeDate } from "@/lib/time";
import { getPublicEnv } from "@/public-env";

function TaskDropdown({ task }: { task: Task }) {
	const { courses } = useApp();

	const course = task.courseId && courses.find(c => c.id === task.courseId);

	return <div className="flex flex-col gap text-left">
		<p>{task.title}</p>
		{task.dueDate && <Subtext>{relativeDate(task.dueDate)}</Subtext>}
		<div className="flex gap-1">
			{task.priority && <div className="text-xs bg-danger-secondary px-1 border border-danger w-fit">{"!".repeat(task.priority)}</div>}
			{course && <div className="text-xs px-1 border w-fit"
				style={{ backgroundColor: getDimmedColor(course.color), borderColor: course.color }}
			>
				{course.name}
			</div>}
		</div>
	</div>;
}

export default function PomodoroPage() {
	const [workTime, setWorkTime] = useState(30);
	const [shortBreak, setShortBreak] = useState(5);
	const [longBreak, setLongBreak] = useState(15);

	const [focusTasks, setFocusTasks] = useState<string[]>([]);

	const { tasks } = useApp();

	function getUrl() {
		const params = new URLSearchParams();
		params.set("w", workTime.toString());
		params.set("s", shortBreak.toString());
		params.set("l", longBreak.toString());
		params.set("f", focusTasks.join(","));
		return `${getPublicEnv().AUTH_URL}/app/study/pomodoro/start?${params.toString()}`;
	}

	return <main className="absolute-center rounded border border-bg-lighter bg-bg-light p-2">
		<Link className="flex items-center gap-1 link" href="/app"><ArrowLeft size={18} /> Home</Link>
		<h2>Pomodoro Timer</h2>
		<Divider />

		<Input className="w-full" label="Work Time (min)" placeholder="30" type="number" value={workTime} onChange={v => setWorkTime(parseFloat(v))} />
		<div className="flex gap-2">
			<Input label="Short Break Time (min)" placeholder="5" type="number" value={shortBreak} onChange={v => setShortBreak(parseFloat(v))} />
			<Input label="Long Break Time (min)" placeholder="15" type="number" value={longBreak} onChange={v => setLongBreak(parseFloat(v))} />
		</div>

		<Divider />

		<p>Tasks to focus on</p>
		<SelectMultiple
			options={sortTasks(tasks).reduce((prev, curr) => ({ ...prev, [curr.id]: <TaskDropdown task={curr} /> }), {})}
			values={focusTasks}
			onChange={setFocusTasks}
		/>

		<ModalFooter>
			<Link href={getUrl()}><Button className="flex items-center gap-1">Start <ArrowRight size={18} /></Button></Link>
		</ModalFooter>
	</main>;
}
