import { useState } from "react";

import { createTerm } from "@/app/actions/terms";
import { Term, TermInsert } from "@/db/types";
import { throwToast } from "@/lib/errors";
import { useObjectState } from "@/lib/hooks";

import { useApp } from "../context/NeptuneContext";
import Button from "../primitives/Button";
import Input from "../primitives/Input";
import { PopoverArrow,PopoverContent } from "../primitives/Popover";

export default function EditTermPopover({ term: defaultTerm, onCreate }: { term?: Term, onCreate?: (term: Term) => void }) {
	const { dispatch } = useApp();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [term, setTerm] = useObjectState<TermInsert>(defaultTerm ?? {
		season: "",
		year: new Date().getFullYear(),
		start: new Date(),
		end: new Date(),
	});

	async function create() {
		setError("");

		if (!term.start || !term.end || !term.season || !term.year)
			return void setError("Fill out all required values.");

		// Ensure they begin/end at 12:00am
		const termStart = new Date(term.start.getFullYear(), term.start.getMonth(), term.start.getDate(), 0, 0);
		const termEnd = new Date(term.end.getFullYear(), term.end.getMonth(), term.end.getDate(), 0, 0);

		if (termStart.getDay() !== 6 || termEnd.getDay() !== 5)
			return void setError("Start must be a Sunday and end must be a Saturday.");

		setLoading(true);

		const res = await createTerm({ ...term, start: termStart, end: termEnd }).catch(e => {
			setLoading(false);
			throw throwToast("Could not create term", e);
		});

		setLoading(false);
		onCreate?.(res);
		dispatch({ context: "terms", type: "create", data: res });
	}

	return <PopoverContent className="z-300 border-2 border-bg-lightest" side="right">
		<PopoverArrow />
		<p className="font-bold">{!defaultTerm ? "Create" : "Edit"} Term</p>
		<div className="flex w-full *:w-full items-center gap-2">
			<Input label="Season" placeholder="Fall" required value={term.season} onChange={v => setTerm({ season: v })} autoFocus />
			<Input label="Year" placeholder="2026" required type="number" value={term.year} onChange={v => setTerm({ year: parseInt(v) })} />
		</div>
		<div className="flex w-full *:w-full items-center gap-2 mb-2">
			<Input label="Start (must be Sunday)" type="date" className="w-full" required value={term.start.toISOString().split("T")[0]} onChange={v => setTerm({ start: new Date(v) })} />
			<Input label="End (must be Saturday)" type="date" className="w-full" required value={term.end.toISOString().split("T")[0]} onChange={v => setTerm({ end: new Date(v) })} />
		</div>
		<Button onClick={create} loading={loading}>Create</Button>
		{error && <p className="text-danger w-full text-center">{error}</p>}
	</PopoverContent>;
}
