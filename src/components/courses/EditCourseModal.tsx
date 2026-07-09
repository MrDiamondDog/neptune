import { PopoverAnchor } from "@radix-ui/react-popover";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { createCourse } from "@/app/actions/courses";
import { createMeeting } from "@/app/actions/meetings";
import { meetingsTable } from "@/db/schema";
import { CourseInsert, MeetingInsert } from "@/db/types";
import { deleteFromArray, modifyArrayItem } from "@/lib/array";
import { throwToast } from "@/lib/errors";
import { useObjectState } from "@/lib/hooks";
import { titleCase } from "@/lib/string";

import { useApp, useAppDispatch } from "../context/NeptuneContext";
import MeetingEditor from "../meetings/MeetingEditor";
import MeetingsInline from "../meetings/MeetingsInline";
import Button, { ButtonLooks } from "../primitives/Button";
import Divider from "../primitives/Divider";
import Input from "../primitives/Input";
import Modal, { ModalFooter, ModalProps } from "../primitives/Modal";
import { Popover } from "../primitives/Popover";
import RequiredStar from "../primitives/RequiredStar";
import { Select } from "../primitives/Select";
import EditTermPopover from "../terms/EditTermPopover";
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

export default function EditCourseModal({ course: defaultCourse, ...props }: { course?: CourseInsert } & ModalProps) {
	const session = useSession();

	const { terms, meetings: meetingsList } = useApp();
	const dispatch = useAppDispatch();

	const [course, setCourse] = useObjectState<CourseInsert>(defaultCourse ?? {
		name: "",
		subject: "",
		number: "",
		type: "lecture",
		termId: "",
	});
	const [meetings, setMeetings] = useState<MeetingInsert[]>(defaultCourse?.id ? meetingsList.filter(m => m.courseId === defaultCourse.id) : []);

	const [step, setStep] = useState(0);
	const [termPopover, setTermPopover] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	if (!session || !session.data?.user)
		return null;

	async function create() {
		setError("");

		if (!course.name || !course.subject || !course.number || !course.termId)
			return void setError("Fill out all required fields.");

		setLoading(true);

		const newCourse = await createCourse(course).catch(e => { throw throwToast("Could not create course.", e); });
		const newMeetings = await Promise.all(
			meetings.map(m => createMeeting({ ...m, courseId: newCourse.id }))
		).catch(e => { throw throwToast("Could not create meeting(s)", e); });

		setLoading(false);
		dispatch({ context: "courses", type: "create", data: newCourse });
		newMeetings.forEach(meeting => dispatch({ context: "meetings", type: "create", data: meeting }));
		props.onClose?.();
	}

	return <Modal {...props} title={`${defaultCourse ? "Edit" : "Create New"} Course`}>
		<Divider />
		{step === 0 && <>
			<Input placeholder="Data Structures" label="Name" className="w-full" required value={course.name} onChange={v => setCourse({ name: v })} />
			<div className="flex w-full gap-2">
				<Input placeholder="CS" label="Subject" required value={course.subject} onChange={v => setCourse({ subject: v })} />
				<Input placeholder="165" label="Course Number" required value={course.number} onChange={v => setCourse({ number: v })} />
			</div>

			<p>Term <RequiredStar /></p>
			<Popover open={termPopover}>
				<PopoverAnchor asChild>
					<Select
						options={{
							...terms.reduce((prev, curr) => ({ ...prev, [curr.id]: `${titleCase(curr.season)} ${curr.year}` }), {}),
							"": "Create..."
						}}
						value={course.termId}
						onChange={v => {
							if (!v)
								setTermPopover(true);
							else
								setTermPopover(false);
							setCourse({ termId: v });
						}}
					/>
				</PopoverAnchor>
				<EditTermPopover onCreate={term => {
					setTermPopover(false);
					setCourse({ termId: term.id });
				}} />
			</Popover>

			<Input placeholder="4" label="Credit Hours" className="w-full" type="number" value={course.creditHours + ""} onChange={v => setCourse({ creditHours: parseInt(v) })} />

			<p>Course Type</p>
			<Select
				options={{ ...courseTypes, "": "Other..." }}
				// If the value isn't included in the course types, it must be "other"
				// If there isn't a course type, default to lecture
				value={!Object.keys(courseTypes).includes(course.type ?? "lecture") ? "" : (course.type ?? "lecture")}
				onChange={v => setCourse({ type: v })}
			/>
			{(!Object.keys(courseTypes).includes(course.type ?? "lecture")) &&
				<Input placeholder="Other Course Type" className="mt-1 w-full" />
			}
		</>}

		{step === 1 && <>
			<div className="bg-bg w-full p-2">
				<div className="flex w-full justify-between items-center">
					<p>Meetings</p>
					<Plus size={20} className="cursor-pointer" onClick={() => setMeetings([...meetings, { ...defaultMeeting, id: (meetings.length - 1) + "" }])} />
				</div>
				{meetings.map(m => <div key={m.id}>
					<Divider />
					<MeetingEditor
						meeting={m}
						onChange={m => setMeetings(modifyArrayItem(meetings, m, "id"))}
						onDelete={() => setMeetings(deleteFromArray(meetings, m, "id"))}
					/>
				</div>)}
			</div>
		</>}

		{step === 2 && <>
			<CourseInline course={course} />
			<MeetingsInline meetings={meetings} />
		</>}

		<ModalFooter error={error}>
			{step !== 0 && <Button onClick={() => setStep(s => s - 1)} look={ButtonLooks.SECONDARY}><ArrowLeft size={16} /> Back</Button>}
			{step !== 2 && <Button onClick={() => setStep(s => s + 1)}>Next <ArrowRight size={16} /></Button>}
			{step === 2 && <Button onClick={create} loading={loading}>Create</Button>}
		</ModalFooter>
	</Modal>;
}
