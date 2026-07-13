"use client";

import { PopoverAnchor } from "@radix-ui/react-popover";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

import { deleteCourse } from "@/app/actions/courses";
import { editMeeting } from "@/app/actions/meetings";
import { Course, CourseInsert } from "@/db/types";

import { useApp } from "../context/NeptuneContext";
import DeletePopover from "../primitives/DeletePopover";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "../primitives/Dropdown";
import { Popover } from "../primitives/Popover";
import Subtext from "../primitives/Subtext";
import EditCourseModal from "./EditCourseModal";

export default function CourseInline({ course, day, meetingId, readOnly }: { course: CourseInsert, day?: Date | null, meetingId?: string | null, readOnly?: boolean }) {
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
		<Popover open={openModal === "delete"} onOpenChange={v => setOpenModal(v ? "delete" : "")}>
			<PopoverAnchor asChild>
				<div className="w-full flex justify-between">
					<p className="font-bold">{course.name}</p>
					{(!readOnly && course.id) && <Dropdown>
						<DropdownTrigger asChild>
							<EllipsisVertical size={20} className="p-1 box-content cursor-pointer text-gray-400 hover:bg-bg-lighter" />
						</DropdownTrigger>
						<DropdownContent>
							<DropdownItem onClick={() => setOpenModal("edit")}>Edit</DropdownItem>
							{(day && meetingId) && <DropdownItem onClick={removeMeeting}>Remove This Meeting</DropdownItem>}
							<DropdownItem className="text-danger" onClick={() => setOpenModal("delete")}>Delete Course</DropdownItem>
						</DropdownContent>
					</Dropdown>}
				</div>
			</PopoverAnchor>

			<DeletePopover what={`${course.subject}${course.number}`} onDelete={() => {
				deleteCourse(course.id!);
				dispatch({ context: "courses", type: "delete", id: course.id! });
			}} />
		</Popover>
		<Subtext className="text-xs">{course.subject} {course.number}</Subtext>

		{(openModal === "edit" && course.id) && <EditCourseModal onClose={() => setOpenModal("")} course={course as Course} />}
	</div>;
}
