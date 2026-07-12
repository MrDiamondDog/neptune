"use client";

import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

import { editMeeting } from "@/app/actions/meetings";
import { CourseInsert } from "@/db/types";

import { useApp } from "../context/NeptuneContext";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "../primitives/Dropdown";
import Subtext from "../primitives/Subtext";
import EditCourseModal from "./EditCourseModal";

export default function CourseInline({ course, day, meetingId }: { course: CourseInsert, day?: Date | null, meetingId?: string | null }) {
	const { meetings, dispatch } = useApp();

	const [openModal, setOpenModal] = useState("");

	async function removeMeeting() {
		if (!meetingId || !day)
			return;

		const meeting = meetings.find(m => m.id === meetingId);
		if (!meeting)
			return;

		const exclusions = [...(meeting.exclusions ?? []), day.toISOString()];

		dispatch({ context: "meetings", type: "edit", data: { id: meeting.id, exclusions } });
		await editMeeting({
			id: meetingId,
			exclusions
		});
	}

	return <div className="w-full">
		<div className="w-full flex justify-between">
			<p className="font-bold">{course.name}</p>
			<Dropdown>
				<DropdownTrigger asChild>
					<EllipsisVertical size={20} className="p-1 box-content cursor-pointer text-gray-400 hover:bg-bg-lighter" />
				</DropdownTrigger>
				<DropdownContent>
					<DropdownItem onClick={() => setOpenModal("edit")}>Edit</DropdownItem>
					{(day && meetingId) && <DropdownItem onClick={removeMeeting}>Remove This Meeting</DropdownItem>}
					<DropdownItem className="text-danger">Delete Course</DropdownItem>
				</DropdownContent>
			</Dropdown>
		</div>
		<Subtext className="text-xs">{course.subject} {course.number}</Subtext>

		<EditCourseModal open={openModal === "edit"} onClose={() => setOpenModal("")} course={course} />
	</div>;
}
