import { useEffect, useState } from "react";

import { getCommit } from "@/app/actions/misc";

import Subtext from "./primitives/Subtext";

export default function VersionInfo() {
	const [commit, setCommit] = useState("");

	useEffect(() => {
		getCommit().then(setCommit).catch(() => setCommit("Could not fetch commit"));
	}, []);

	return <Subtext className="w-full text-center">Ver. {commit}</Subtext>;
}
