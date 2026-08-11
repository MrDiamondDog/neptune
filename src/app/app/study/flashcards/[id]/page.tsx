"use client";

import { ArrowLeft, ArrowRight, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";

import { editFlashcard } from "@/app/actions/flashcards";
import { createStudySession } from "@/app/actions/studySessions";
import { useApp } from "@/components/context/NeptuneContext";
import { DashboardCard } from "@/components/misc/DashboardCard";
import Button, { ButtonLooks } from "@/components/primitives/Button";
import Checkbox from "@/components/primitives/Checkbox";
import Divider from "@/components/primitives/Divider";
import Modal from "@/components/primitives/Modal";
import Subtext from "@/components/primitives/Subtext";
import { shuffle } from "@/lib/array";
import { prettyDuration } from "@/lib/time";

export default function FlashcardPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);

	const { flashcards } = useApp();

	const [set, setSet] = useState(flashcards.find(f => f.id === id));

	const [index, setIndex] = useState(0);
	const [side, setSide] = useState(0);
	const [transition, setTransition] = useState(0);

	const [randomOrder, setRandomOrder] = useState(false);
	const [reversed, setReversed] = useState(false);

	const [secondsElapsed, setSecondsElapsed] = useState(0);
	const [loading, setLoading] = useState(false);

	const [settingsOpen, setSettingsOpen] = useState(false);

	const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const router = useRouter();

	function flip() {
		setTransition(t => t === 0 ? 1 : 0);
		timeout.current = setTimeout(() => setSide(s => s === 0 ? 1 : 0), 100);
	}

	async function finish() {
		if (!id || !set)
			return;

		setLoading(true);
		await editFlashcard({ id, lastUsed: new Date() });
		await createStudySession({ date: new Date(), secondsElapsed, type: "flashcards" });
		setLoading(false);
		router.push("/app/study/flashcards");
	}

	const restart = useCallback(() => {
		if (!set)
			return;
		setIndex(0);
		setSide(reversed ? 1 : 0);
		setTransition(0);
		if (timeout.current) {
			clearTimeout(timeout.current);
			timeout.current = null;
		}
		if (randomOrder)
			setSet({ ...set, data: shuffle(set.data) });
	}, [set, randomOrder, reversed]);

	const prev = useCallback(() => {
		if (!set)
			return;
		setIndex(i => i === 0 ? i : i - 1);
		setTransition(0);
		setSide(reversed ? 1 : 0);
		if (timeout.current) {
			clearTimeout(timeout.current);
			timeout.current = null;
		}
	}, [set, reversed]);

	const next = useCallback(() => {
		if (!set)
			return;
		if (index >= set.data.length)
			return void restart();
		setIndex(i => i >= set.data.length ? i : i + 1);
		setTransition(0);
		setSide(reversed ? 1 : 0);
		if (timeout.current) {
			clearTimeout(timeout.current);
			timeout.current = null;
		}
	}, [set, index, restart, reversed]);

	useEffect(() => {
		const foundSet = flashcards.find(f => f.id === id);
		if (randomOrder && foundSet)
			setSet({ ...foundSet, data: shuffle(foundSet.data) });
		else if (!randomOrder && foundSet)
			setSet(flashcards.find(f => f.id === id));
	}, [randomOrder, flashcards, id]);

	useEffect(() => {
		const interval = setInterval(() => setSecondsElapsed(s => s + 1), 1000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		function listen(e: KeyboardEvent) {
			if (e.key === " " || e.key === "ArrowUp") {
				e.preventDefault();
				e.stopPropagation();
				flip();
			} else if (e.key === "ArrowLeft")
				prev();
			else if (e.key === "ArrowRight")
				next();
		}

		window.addEventListener("keydown", listen);

		return () => window.removeEventListener("keydown", listen);
	}, [next, prev]);

	if (!set)
		return null;

	const currentCard = set.data[index];

	return <main className="absolute-center w-100 flex flex-col gap-2">
		<DashboardCard className="relative">
			<Link href="/app/study/flashcards" className="link flex gap-1 items-center"><ArrowLeft size={18} /> Back</Link>
			<h2>{set.name}</h2>
			<Subtext>{set.data.length} flashcards</Subtext>

			<Button look={ButtonLooks.SECONDARY} className="w-fit! absolute top-2 right-2 text-gray-500" onClick={() => setSettingsOpen(true)}><Settings /></Button>
		</DashboardCard>
		{index < set.data.length ? <div
			className="w-full text-xl flex justify-center items-center bg-bg-light rounded-2xl h-50 cursor-pointer transition-transform duration-200 ease-linear select-none p-2 text-center"
			style={{ transform: transition === 0 ? "rotateY(0deg)" : "rotateY(180deg)" }}
			onClick={flip}
		>
			<p style={{ transform: ((side === 0 && !reversed) || (side === 1 && reversed)) ? "rotateY(0deg)" : "rotateY(180deg)" }}>{currentCard[side]}</p>
		</div> : <DashboardCard className="text-center">
			<p>You finished all the flashcards!</p>
			<p>You've been studying for {prettyDuration(secondsElapsed)}.</p>
		</DashboardCard>}
		<div className="flex w-full">
			{(index > 0 && index < set.data.length) && <Button look={ButtonLooks.SECONDARY} onClick={prev}><ArrowLeft /></Button>}
			{index < set.data.length && <Button look={ButtonLooks.PRIMARY} onClick={next}><ArrowRight /></Button>}

			{index >= set.data.length && <>
				<Button look={ButtonLooks.SECONDARY} onClick={restart}>Restart</Button>
				<Button onClick={finish} loading={loading}>Finish</Button>
			</>}
		</div>
		{index < set.data.length && <Subtext className="w-full text-center">{set.data.length - index - 1} cards left</Subtext>}

		<Modal title="Flashcard Settings" open={settingsOpen} onClose={() => setSettingsOpen(false)}>
			<Divider />

			<Checkbox checked={randomOrder} onCheckedChange={setRandomOrder}>Random Order</Checkbox>
			<Checkbox checked={reversed} onCheckedChange={c => {
				if (c)
					setSide(1);
				else
					setSide(0);
				setReversed(c);
			}}>Reversed Sides</Checkbox>
		</Modal>
	</main>;
}
