"use client";

import { BookOpenText, ClockIcon, Plus, Settings, StickyNoteCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import EditCourseModal from "../courses/EditCourseModal";
import Button, { ButtonLooks } from "../primitives/Button";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "../primitives/Dropdown";
import Clock from "./Clock";
import Neptune from "./Neptune";

export default function Header() {
	const [openModal, setOpenModal] = useState("");

	const router = useRouter();

	return <div className="flex w-full *:w-full justify-between items-center mt-2">
		<Neptune />
		<Clock />
		<div className="flex gap-2 items-center justify-end">
			<Dropdown>
				<DropdownTrigger asChild>
					<Button className="w-fit! py-2"><Plus /></Button>
				</DropdownTrigger>
				<DropdownContent>
					<DropdownItem onClick={() => setOpenModal("new-course")}>New Course...</DropdownItem>
				</DropdownContent>
			</Dropdown>
			<Dropdown>
				<DropdownTrigger asChild>
					<Button className="w-fit! py-2" look={ButtonLooks.SECONDARY}><BookOpenText /></Button>
				</DropdownTrigger>
				<DropdownContent className="*:flex *:gap-2 *:items-center">
					<DropdownItem onClick={() => router.push("/app/study/pomodoro")}><ClockIcon size={18} /> Pomodoro</DropdownItem>
					<DropdownItem onClick={() => router.push("/app/study/flashcards")}><StickyNoteCheck size={18} /> Flashcards</DropdownItem>
					{/* <DropdownItem onClick={() => router.push("/app/study/quiz")}><FileCheck size={18} /> Quiz</DropdownItem>*/}
				</DropdownContent>
			</Dropdown>
			<Link href="/app/settings"><Button className="py-2" look={ButtonLooks.SECONDARY}><Settings /></Button></Link>
		</div>

		{openModal === "new-course" && <EditCourseModal onClose={() => setOpenModal("")} />}
	</div>;
}
