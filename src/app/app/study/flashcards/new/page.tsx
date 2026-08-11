"use client";

import { ArrowLeft, ChevronDown, ChevronUp, Download, Plus, Save, Trash2 } from "lucide-react";
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
import Modal, { ModalFooter } from "@/components/primitives/Modal";
import Subtext from "@/components/primitives/Subtext";
import { deleteFromArray, modifyArrayItem, moveArrayItem } from "@/lib/array";
import { throwToast } from "@/lib/errors";

export default function NewFlashcardPage() {
	const { dispatch } = useApp();

	const [name, setName] = useState("");
	const [flashcards, setFlashcards] = useState<{ id: string, key: string, value: string }[]>([{ id: "0", key: "", value: "" }]);

	const [importOpen, setImportOpen] = useState(false);
	const [importText, setImportText] = useState("");
	const [delimiter, setDelimiter] = useState(",");

	const foundFlashcards = importText.split("\n").map(l => l.split(delimiter)).filter(f => f.length === 2);

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

	function importFlashcards(mode: "replace" | "add") {
		if (foundFlashcards.length === 0)
			return;

		const newFlashcards = foundFlashcards.map(f => ({ id: Math.floor(Math.random() * 100000000).toFixed(0), key: f[0], value: f[1] }));

		if (mode === "replace")
			setFlashcards(newFlashcards);
		else
			setFlashcards([...flashcards, ...newFlashcards]);

		setImportText("");
		setImportOpen(false);
	}

	return <main className="mx-auto w-[95%] md:w-200 overflow-x-hidden py-2 flex flex-col gap-2">
		<DashboardCard>
			<Link href="/app/study/flashcards" className="link flex gap-1 items-center"><ArrowLeft size={18} /> Back</Link>
			<div className="flex justify-between items-center">
				<h2>New Flashcard Set</h2>
				<div className="flex gap-1">
					<Button onClick={() => setImportOpen(true)} look={ButtonLooks.SECONDARY2}><Download size={18} /> Import</Button>
					<Button onClick={save} loading={loading}><Save size={18} /> Save</Button>
				</div>
			</div>
			<Divider />

			<Input label="Name" required className="w-full" value={name} onChange={setName} />
		</DashboardCard>

		<Button look={ButtonLooks.SECONDARY} onClick={() => setFlashcards([...flashcards, { id: Math.floor(Math.random() * 100000000).toFixed(0), key: "", value: "" }])}><Plus /></Button>

		{flashcards.map((f, i) => <DashboardCard key={f.id}>
			<div className="flex gap-2">
				<Input value={f.key} placeholder="Front" className="w-full" onChange={v => setFlashcards(modifyArrayItem(flashcards, { ...f, key: v }, "id"))} multiline />
				<Input value={f.value} placeholder="Back" className="w-full" onChange={v => setFlashcards(modifyArrayItem(flashcards, { ...f, value: v }, "id"))} multiline />
			</div>
			<div className="*:w-fit! mt-2 flex justify-end text-gray-500">
				<Button look={ButtonLooks.SECONDARY} onClick={() => setFlashcards(moveArrayItem(flashcards, i, "up"))}><ChevronUp /></Button>
				<Button look={ButtonLooks.SECONDARY} onClick={() => setFlashcards(moveArrayItem(flashcards, i, "down"))}><ChevronDown /></Button>
				<Button look={ButtonLooks.SECONDARY} onClick={() => setFlashcards(deleteFromArray(flashcards, f, "id"))}><Trash2 /></Button>
			</div>
		</DashboardCard>)}

		<Modal title="Import Flashcards" open={importOpen} onClose={() => setImportOpen(false)}>
			<Divider />

			<Input className="min-w-100 h-50" multiline placeholder="One flashcard per line, with delimiter between each side" value={importText} onChange={setImportText} />

			<Input className="w-full" label="Delimeter" value={delimiter} onChange={setDelimiter} />

			<Subtext>Found {foundFlashcards.length} flashcard(s).</Subtext>

			<ModalFooter>
				<Button className="text-nowrap" look={ButtonLooks.SECONDARY2} onClick={() => importFlashcards("replace")}>Replace All</Button>
				<Button className="text-nowrap" onClick={() => importFlashcards("add")}>Add All</Button>
			</ModalFooter>
		</Modal>
	</main>;
}
