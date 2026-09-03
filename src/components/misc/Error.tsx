"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { catchError, ErrorInfo } from "next/error";
import { useState } from "react";

import Button, { ButtonLooks } from "../primitives/Button";
import Divider from "../primitives/Divider";
import Subtext from "../primitives/Subtext";

function ErrorFallback(_: any, { error, retry }: ErrorInfo) {
	const [details, setDetails] = useState(false);

	const e = error as Error;

	return <div className="absolute-center p-2 border border-bg-lighter bg-bg-light rounded max-w-1/2">
		<h2>Uh Oh!</h2>
		<p>Something went wrong. Please check the console.</p>
		<Subtext onClick={() => setDetails(d => !d)} className="flex items-center cursor-pointer gap-1">
			{details ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Show Details
		</Subtext>

		{details && <div className="border-l-5 border-bg-lighter pl-2 max-h-[50vh] overflow-scroll w-full">
			{typeof error === "string" ? <p>{error}</p> : <>
				<p>{e.name}: {e.message}</p>
				<Subtext className="whitespace-pre-wrap text-nowrap!">{e.cause as string}</Subtext>
				<Subtext className="whitespace-pre-wrap text-nowrap!">{e.stack}</Subtext>
			</>}
		</div>}

		<Divider />

		<div className="flex w-full gap-1">
			<Button onClick={retry}>Retry</Button>
			<Button onClick={() => console.error(error)} look={ButtonLooks.SECONDARY2}>Print Error</Button>
		</div>
	</div>;
}

export const ErrorBoundary = catchError(ErrorFallback);
