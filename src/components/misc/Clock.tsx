"use client";

import { useEffect, useState } from "react";

import { prettyDate, prettyTime } from "@/lib/time";

export default function Clock() {
	const [date, setDate] = useState<Date>();

	useEffect(() => {
		setDate(new Date());
		const interval = setInterval(() => {
			setDate(new Date());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	if (!date)
		return null;

	return <div className="text-gray-500">
		<p className="text-center text-lg">{prettyTime(date)}</p>
		<p className="text-center text-sm">{prettyDate(date, "hide")}</p>
	</div>;
}
