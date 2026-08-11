"use client";

import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createFlashcard } from "@/app/actions/flashcards";
import { useApp } from "@/components/context/NeptuneContext";
import { DashboardCard } from "@/components/misc/DashboardCard";
import Button, { ButtonLooks } from "@/components/primitives/Button";
import Divider from "@/components/primitives/Divider";
import Input from "@/components/primitives/Input";
import { deleteFromArray, modifyArrayItem } from "@/lib/array";
import { throwToast } from "@/lib/errors";

export default function NewFlashcardPage() {
	const { dispatch } = useApp();

	const [name, setName] = useState("");
	const [flashcards, setFlashcards] = useState<{ id: string, key: string, value: string }[]>([{ id: "0", key: "", value: "" }]);

	const [loading, setLoading] = useState(false);

	const router = useRouter();

	async function save() {
		if (!name || !flashcards.length)
			return void toast.error("Please specify a name and at least 1 flashcard.");

		if (flashcards.filter(f => !f.key || !f.value).length > 0)
			return void toast.error("One or more flashcards have empty side(s).");

		setLoading(true);

		const res = await createFlashcard({
			name,
			data: flashcards.map(f => [f.key, f.value])
		}).catch(e => { throw throwToast("Could not create flashcard set.", e); });

		dispatch({ context: "flashcards", type: "create", data: res });

		setLoading(false);
		router.push("/app/study/flashcards");
	}

	return <main className="mx-auto w-[95%] md:w-200 overflow-x-hidden py-2 flex flex-col gap-2">
		<DashboardCard>
			<Link href="/app/study/flashcards" className="link flex gap-1 items-center"><ArrowLeft size={18} /> Back</Link>
			<div className="flex justify-between items-center">
				<h2>New Flashcard Set</h2>
				<Button onClick={save} className="w-fit!" loading={loading}><Save size={18} /> Save</Button>
			</div>
			<Divider />

			<Input label="Name" required className="w-full" value={name} onChange={setName} />
		</DashboardCard>

		<Button look={ButtonLooks.SECONDARY} onClick={() => setFlashcards([...flashcards, { id: Math.floor(Math.random() * 100000000).toFixed(0), key: "", value: "" }])}><Plus /></Button>

		{flashcards.map(f => <DashboardCard key={f.id}>
			<div className="flex gap-2">
				<Input value={f.key} placeholder="Front" className="w-full" onChange={v => setFlashcards(modifyArrayItem(flashcards, { ...f, key: v }, "id"))} multiline />
				<Input value={f.value} placeholder="Back" className="w-full" onChange={v => setFlashcards(modifyArrayItem(flashcards, { ...f, value: v }, "id"))} multiline />
			</div>
			<div className="*:w-fit! mt-2 flex justify-end">
				<Button look={ButtonLooks.SECONDARY} onClick={() => setFlashcards(deleteFromArray(flashcards, f, "id"))}><Trash2 /></Button>
			</div>
		</DashboardCard>)}
	</main>;
}
