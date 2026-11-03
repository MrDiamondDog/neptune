import { useState } from "react";

import { createTerm, editTerm } from "@/app/actions/terms";
import { Term, TermInsert } from "@/db/types";
import { throwToast } from "@/lib/errors";
import { useObjectState } from "@/lib/hooks";
import { epochToTemporal, temporalToEpoch } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import Button from "../primitives/Button";
import Input from "../primitives/Input";
import { PopoverArrow,PopoverContent } from "../primitives/Popover";

export default function EditTermPopover({ term: defaultTerm, onCreate, side }: { term?: Term, onCreate?: (term: Term) => void, side?: "right" | "top" | "bottom" | "left" }) {
	const { dispatch } = useApp();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [term, setTerm] = useObjectState<TermInsert>(defaultTerm ?? {
		season: "",
		year: Temporal.Now.plainDateISO().year,
		start: Temporal.Now.instant().epochMilliseconds,
		end: Temporal.Now.instant().epochMilliseconds,
	});

	function toDateInputValue(ms: number) {
		const date = epochToTemporal(ms);
		return `${date.year}-${date.month.toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`;
	}

	async function create() {
		setError("");

		if (!term.start || !term.end || !term.season || !term.year)
			return void setError("Fill out all required values.");

		const termStart = epochToTemporal(term.start);
		const termEnd = epochToTemporal(term.end);

		if (termStart.dayOfWeek !== 7 || termEnd.dayOfWeek !== 6)
			return void setError("Start must be a Sunday and end must be a Saturday.");

		if (term.year !== termStart.year)
			return void setError("Term start year must match term year.");

		setLoading(true);

		if (!defaultTerm) {
			const res = await createTerm({ ...term, start: temporalToEpoch(termStart), end: temporalToEpoch(termEnd) }).catch(e => {
				setLoading(false);
				throw throwToast("Could not create term", e);
			});
			onCreate?.(res);
			dispatch({ context: "terms", type: "create", data: res });
		} else {
			const res = await editTerm({ ...term, id: defaultTerm.id, start: temporalToEpoch(termStart), end: temporalToEpoch(termEnd) }).catch(e => {
				setLoading(false);
				throw throwToast("Could not edit term", e);
			});
			onCreate?.(res);
			dispatch({ context: "terms", type: "edit", data: res });
		}

		setLoading(false);
	}

	return <PopoverContent className="z-300 border-2 border-bg-lightest" side={side}>
		<PopoverArrow />
		<p className="font-bold">{!defaultTerm ? "Create" : "Edit"} Term</p>
		<div className="flex w-full *:w-full items-center gap-2">
			<Input label="Season" placeholder="Fall" required value={term.season} onChange={v => setTerm({ season: v })} autoFocus />
			<Input label="Year" placeholder="2026" required type="number" value={term.year} onChange={v => setTerm({ year: parseInt(v) })} />
		</div>
		<div className="flex w-full *:w-full items-center gap-2 mb-2">
			<Input label="Start (must be Sunday)" type="date" className="w-full" required value={toDateInputValue(term.start)} onChange={v => setTerm({ start: new Date(v).getTime() })} />
			<Input label="End (must be Saturday)" type="date" className="w-full" required value={toDateInputValue(term.end)} onChange={v => setTerm({ end: new Date(v).getTime() })} />
		</div>
		<Button onClick={create} loading={loading}>{defaultTerm ? "Edit" : "Create"}</Button>
		{error && <p className="text-danger w-full text-center">{error}</p>}
	</PopoverContent>;
}
