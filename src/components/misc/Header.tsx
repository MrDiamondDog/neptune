"use client";

import { Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import EditCourseModal from "../courses/EditCourseModal";
import Button, { ButtonLooks } from "../primitives/Button";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "../primitives/Dropdown";
import Clock from "./Clock";
import Neptune from "./Neptune";

export default function Header() {
	const [openModal, setOpenModal] = useState("");

	return <div className="flex w-full *:w-full justify-between items-center mt-2">
		<Neptune />
		<Clock />
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
