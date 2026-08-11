"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useApp } from "@/components/context/NeptuneContext";
import Button from "@/components/primitives/Button";
import Divider from "@/components/primitives/Divider";
import Subtext from "@/components/primitives/Subtext";
import { relativeDate } from "@/lib/time";

export default function FlashcardsPage() {
	const { flashcards } = useApp();

	const router = useRouter();

	return <main className="absolute-center rounded border border-bg-lighter bg-bg-light p-2">
		<Link className="flex items-center gap-1 link" href="/app"><ArrowLeft size={18} /> Home</Link>
		<h2>Flashcards</h2>
		<Divider />

		<Link href="/app/study/flashcards/new"><Button><Plus /> New Set</Button></Link>
		<Divider />

		{!!flashcards.length && <div className="grid grid-cols-2 gap-2">
			{flashcards.map(f => <div className="bg-bg-lighter p-2 pr-4 border border-transparent hover:border-primary cursor-pointer" key={f.id}
				onClick={() => router.push(`/app/study/flashcards/${f.id}`)}>
				<h3>{f.name}</h3>
				<Subtext>{f.data.length} flashcards</Subtext>
				<Subtext>Last used {f.lastUsed ? relativeDate(f.lastUsed) : "never"}</Subtext>
			</div>)}
		</div>}
		{!flashcards.length && <Subtext>You have no flashcard sets!</Subtext>}
	</main>;
}
