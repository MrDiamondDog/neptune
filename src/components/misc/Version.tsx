import { useEffect, useState } from "react";

import Subtext from "../primitives/Subtext";

export default function VersionInfo() {
	const [commit, setCommit] = useState("");

	useEffect(() => {
		fetch("/version.txt").then(res => res.text()).then(setCommit).catch(() => setCommit("Could not fetch commit"));
	}, []);

	return <Subtext className="w-full text-center">Ver. {commit}</Subtext>;
}
