"use client";

import { Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect,useState } from "react";

import { prettyDate,prettyTime } from "@/lib/time";

import EditCourseModal from "./courses/EditCourseModal";
import Neptune from "./Neptune";
import Button, { ButtonLooks } from "./primitives/Button";
import { Dropdown, DropdownContent, DropdownItem,DropdownTrigger } from "./primitives/Dropdown";

export default function Header() {
	const [date, setDate] = useState<Date>();
	const [openModal, setOpenModal] = useState("");

	useEffect(() => {
		setDate(new Date());
		const interval = setInterval(() => {
			setDate(new Date());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return <div className="flex w-full *:w-full justify-between items-center mt-2">
		<Neptune />
		{date && <div className="text-gray-500">
			<p className="text-center text-lg">{prettyTime(date)}</p>
			<p className="text-center text-sm">{prettyDate(date, "hide")}</p>
		</div>}
		<div className="flex gap-2 items-center justify-end">
			<Dropdown>
				<DropdownTrigger asChild>
					<Button className="w-fit!"><Plus /></Button>
				</DropdownTrigger>
				<DropdownContent>
					<DropdownItem onClick={() => setOpenModal("new-course")}>New Course...</DropdownItem>
				</DropdownContent>
			</Dropdown>
			<Link href="/app/settings">
				<Button look={ButtonLooks.SECONDARY}><Settings /></Button>
			</Link>
		</div>

		{openModal === "new-course" && <EditCourseModal onClose={() => setOpenModal("")} />}
	</div>;
}
