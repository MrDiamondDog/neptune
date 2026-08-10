"use client";

import { PopoverAnchor } from "@radix-ui/react-popover";
import { ArrowRight, Eye, EyeOff, FastForward, Home, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { createStudySession } from "@/app/actions/studySessions";
import { useApp } from "@/components/context/NeptuneContext";
import Button, { ButtonLooks } from "@/components/primitives/Button";
import Divider from "@/components/primitives/Divider";
import { ModalFooter } from "@/components/primitives/Modal";
import { Popover, PopoverArrow, PopoverContent } from "@/components/primitives/Popover";
import Task from "@/components/tasks/Task";
import { Task as TaskType } from "@/db/types";
import { throwToast } from "@/lib/errors";
import { sortTasks } from "@/lib/tasks";
import { prettyDuration } from "@/lib/time";

export default function StartPomodoroPage() {
	const searchParams = useSearchParams();

	const { tasks: tasksList } = useApp();

	const workTime = parseFloat(searchParams.get("w") ?? "NaN") * 60;
	const shortBreak = parseFloat(searchParams.get("s") ?? "NaN") * 60;
	const longBreak = parseFloat(searchParams.get("l") ?? "NaN") * 60;
	const focusTasks = (searchParams.get("f") ?? "").split(",");

	const tasks = focusTasks.map(t => tasksList.find(l => l.id === t)).filter(Boolean) as TaskType[];

	const [active, setActive] = useState(true);
	const [timerVisible, setTimerVisible] = useState(true);
	const [start, setStart] = useState(new Date());
	const [initialTime, setInitialTime] = useState(workTime);
	const [timeLeft, setTimeLeft] = useState(workTime);
	const [secondsElapsed, setSecondsElapsed] = useState(0);
	const [confirmation, setConfirmation] = useState(false);
	const [nextBreak, setNextBreak] = useState<"short" | "long">("short");
	const [state, setState] = useState<"work" | "break" | "complete">("work");

	const interval = useRef<ReturnType<typeof setTimeout> | null>(null);

	const completedTasks = tasks.filter(t => t.complete);
	const allTasksComplete = completedTasks.length === tasks.length;

	function notif(text: string) {
		if (document.hasFocus())
			toast.info(text);
		else
			new Notification(text, { icon: "/neptune.png" });
	}

	function startBreak() {
		setTimeLeft(nextBreak === "short" ? shortBreak : longBreak);
		setInitialTime(nextBreak === "short" ? shortBreak : longBreak);
		setNextBreak(nextBreak === "short" ? "long" : "short");
		setState("break");
		notif("Time for a break!");
	}

	function startWork() {
		setTimeLeft(workTime);
		setInitialTime(workTime);
		setState("work");
		notif("Your break is over!");
	}

	function nextTimer() {
		if (state === "work")
			startBreak();
		else
			startWork();
	}

	function finish() {
		setConfirmation(false);
		setState("complete");
		setActive(false);
		createStudySession({
			type: "pomodoro",
			date: start,
			secondsElapsed
		}).catch(e => throwToast("Could not create study session.", e));
	}

	useEffect(() => {
		if (active && !interval.current)
			interval.current = setInterval(() => {
				setTimeLeft(t => t - 1);
				setSecondsElapsed(s => s + 1);
			}, 1000);
		else if (!active) {
			if (interval.current)
				clearInterval(interval.current);
			interval.current = null;
		}
	}, [active]);

	useEffect(() => {
		if (timeLeft <= 0)
			nextTimer();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeLeft]);

	useEffect(() => {
		if (!("Notification" in window))
			return;

		Notification.requestPermission();
	}, []);

	useEffect(() => {
		function preventLeave(e: Event) {
			if (state !== "complete") {
				e.preventDefault();
			}
		}

		window.addEventListener("beforeunload", preventLeave);

		return () => window.removeEventListener("beforeunload", preventLeave);
	}, [state]);

	return <main className="absolute-center bg-bg-light border border-bg-lighter rounded p-2">
		{state !== "complete" && <>
			<div className="flex">
				<div className="aspect-square size-50 relative">
					<svg width="200" height="200" className="absolute-center">
						<circle cx="100" cy="100" r="90" strokeWidth="20" stroke="var(--color-bg-lighter)" fill="none" />
						<circle cx="100" cy="100" r="90" strokeWidth="20" stroke={active ? "var(--color-secondary)" : "var(--color-primary)"} fill="none"
							transform="rotate(90 100 100) translate(200 0) scale(-1 1)"
							pathLength="360"
							strokeDasharray={`${(timeLeft / initialTime) * 360} 360`}
							strokeDashoffset="0"
							strokeLinecap="round"
							className="transition-all" />
					</svg>
					<div className="absolute-center flex flex-col items-center gap-1 text-gray-500">
						<p className="-mb-2">{state}</p>
						<p className="text-xl font-bold text-white">{timerVisible ? prettyDuration(timeLeft) : "--:--"}</p>
						<div className="flex gap-1 cursor-pointer">
							<div onClick={() => setActive(!active)}>{active ? <Pause /> : <Play />}</div>
							<div onClick={() => setTimerVisible(!timerVisible)}>{timerVisible ? <Eye /> : <EyeOff />}</div>
							<div><FastForward onClick={nextTimer} /></div>
						</div>
					</div>
				</div>
				{!!tasks.length && <Divider vertical />}
				<div className="w-full">
					{sortTasks(tasks).map(t => <Task task={t} key={t.id} />)}
				</div>
			</div>
			<ModalFooter>
				<a href="/app/study/pomodoro"><Button look={ButtonLooks.SECONDARY2}>Cancel</Button></a>
				<Popover open={confirmation} onOpenChange={setConfirmation}>
					<PopoverAnchor asChild>
						<Button
							look={allTasksComplete ? ButtonLooks.PRIMARY : ButtonLooks.SECONDARY2}
							onClick={() => allTasksComplete ? finish() : setConfirmation(true)}
						>
							Done <ArrowRight size={18} />
						</Button>
					</PopoverAnchor>
					<PopoverContent className="border border-bg-lighter" side="right">
						<PopoverArrow />
						<h2>Are you sure?</h2>
						<p>You haven't completed all of your tasks.</p>
						<Divider />
						<div className="flex gap-2">
							<Button look={ButtonLooks.SECONDARY2} onClick={finish}>I'm Finished</Button>
							<Button onClick={() => setConfirmation(false)}>Keep Working</Button>
						</div>
					</PopoverContent>
				</Popover>
			</ModalFooter>
		</>}
		{state === "complete" && <div>
			<h2>Great Work!</h2>
			<p>You studied for {prettyDuration(secondsElapsed)}{!!completedTasks.length ? ` and completed ${completedTasks.length} tasks.` : "."}</p>
			<ModalFooter>
				<Link href="/app"><Button><Home size={18} /> Home</Button></Link>
			</ModalFooter>
		</div>}
	</main>;
}
