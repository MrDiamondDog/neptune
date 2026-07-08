import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { coursesTable, meetingsTable } from "@/db/schema";
import { Course } from "@/db/types";
import { deleteFromArray, modifyArrayItem } from "@/lib/array";
import { useObjectState } from "@/lib/hooks";

import MeetingEditor from "../meetings/MeetingEditor";
import MeetingsInline from "../meetings/MeetingsInline";
import Button, { ButtonLooks } from "../primitives/Button";
import Divider from "../primitives/Divider";
import Input from "../primitives/Input";
import Modal, { ModalFooter, ModalProps } from "../primitives/Modal";
import { Select } from "../primitives/Select";
import CourseInline from "./CourseInline";

export const courseTypes = {
	"lecture": "Lecture",
	"recitation": "Recitation",
	"lab": "Lab",
	"seminar": "Seminar",
	"section": "Section",
	"studio": "Studio",
	"online": "Online",
};

const defaultMeeting: typeof meetingsTable.$inferInsert = {
	courseId: "",
	days: "",
	timeStart: 0,
	timeEnd: 0,
	userId: "",
};

export default function EditCourseModal({ course, ...props }: { course?: Course } & ModalProps) {
	const session = useSession();

	const [courseData, setCourseData] = useObjectState<typeof coursesTable.$inferInsert>(course ?? {
		userId: "",
		name: "",
		subject: "",
		number: "",
		type: "lecture",
		termId: "",
	});

	const [meetings, setMeetings] = useState<(typeof meetingsTable.$inferInsert)[]>([]);

	const [step, setStep] = useState(0);

	if (!session || !session.data?.user)
		return null;

	async function create() {

	}

	return <Modal {...props} title={`${course ? "Edit" : "Create New"} Course`}>
		<Divider />
		{step === 0 && <>
			<Input placeholder="Data Structures" label="Name" className="w-full" required value={courseData.name} onChange={v => setCourseData({ name: v })} />
			<div className="flex w-full gap-2">
				<Input placeholder="CS" label="Subject" required value={courseData.subject} onChange={v => setCourseData({ subject: v })} />
				<Input placeholder="165" label="Course Number" required value={courseData.number} onChange={v => setCourseData({ number: v })} />
			</div>

			<Input placeholder="4" label="Credit Hours" className="w-full" type="number" value={courseData.creditHours + ""} onChange={v => setCourseData({ creditHours: parseInt(v) })} />

			<p>Course Type</p>
			<Select
				options={{ ...courseTypes, "": "Other..." }}
				// If the value isn't included in the course types, it must be "other"
				// If there isn't a course type, default to lecture
				value={!Object.keys(courseTypes).includes(courseData.type ?? "lecture") ? "" : (courseData.type ?? "lecture")}
				onChange={v => setCourseData({ type: v })}
			/>
			{(!Object.keys(courseTypes).includes(courseData.type ?? "lecture")) &&
				<Input placeholder="Other Course Type" className="mt-1 w-full" />
			}
		</>}

		{step === 1 && <>
			<div className="bg-bg w-full p-2">
				<div className="flex w-full justify-between items-center">
					<p>Meetings</p>
					<Plus size={20} className="cursor-pointer" onClick={() => setMeetings([...meetings, { ...defaultMeeting, id: (meetings.length - 1) + "" }])} />
				</div>
				{meetings.map((m, i) => <>
					<Divider />
					<MeetingEditor
						meeting={m}
						onChange={m => setMeetings(modifyArrayItem(meetings, m, "id"))}
						onDelete={() => setMeetings(deleteFromArray(meetings, m, "id"))}
						key={m.id}
					/>
				</>)}
			</div>
		</>}

		{step === 2 && <>
			<CourseInline course={courseData} />
			<MeetingsInline meetings={meetings} />
		</>}

		<ModalFooter>
			{step !== 0 && <Button onClick={() => setStep(s => s - 1)} look={ButtonLooks.SECONDARY}><ArrowLeft size={16} /> Back</Button>}
			{step !== 2 && <Button onClick={() => setStep(s => s + 1)}>Next <ArrowRight size={16} /></Button>}
			{step === 2 && <Button onClick={create}>Create</Button>}
		</ModalFooter>
	</Modal>;
}
