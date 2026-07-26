"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

function Greeting() {
	const session = useSession();

	if (!session || !session.data)
		return null;

	const time = new Date().getHours();

	return <h1>Good {time < 12 ? "Morning" : (time < 18 ? "Afternoon" : "Evening")}, {session.data.user!.name}</h1>;
}

export default dynamic(() => Promise.resolve(Greeting), { ssr: false });
