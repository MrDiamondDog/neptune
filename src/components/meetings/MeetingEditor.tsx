import { Plus, Trash2, X } from "lucide-react";

import { MeetingInsert } from "@/db/types";
import { minutesToTime, timeToMinutes } from "@/lib/time";

import Button, { ButtonLooks } from "../primitives/Button";
import Input from "../primitives/Input";
import LinkButton from "../primitives/LinkButton";

const daysOfWeek = {
	"U": "Sun",
	"M": "Mon",
	"T": "Tue",
	"W": "Wed",
	"R": "Thu",
	"F": "Fri",
	"S": "Sat"
};

export default function MeetingEditor({ meeting, onChange, onDelete }: {
	meeting: MeetingInsert,
	onChange: (m: MeetingInsert) => void,
	onDelete: () => void,
}) {
	return <div className="flex flex-col gap-1">
		<div className="w-full flex">
			{Object.entries(daysOfWeek).map(e => <Button
				onClick={() => onChange({
					...meeting,
					days: meeting.days.includes(e[0]) ?
						[...meeting.days].filter(d => d !== e[0]).join("") :
						[...meeting.days, e[0]].join("")
				})}
				look={meeting.days.includes(e[0]) ? ButtonLooks.PRIMARY : ButtonLooks.SECONDARY}
				className="w-full"
				key={e[0]}
			>
				{e[1]}
			</Button>)}
		</div>

		<div className="flex gap-2 *:w-full">
			<Input
				label="Start Time"
				type="time"
				className="w-full"
				value={minutesToTime(meeting.timeStart)}
				onChange={t => onChange({ ...meeting, timeStart: timeToMinutes(t) })}
			/>
			<Input
				label="End Time"
				type="time"
				className="w-full"
				value={minutesToTime(meeting.timeEnd)}
				onChange={t => onChange({ ...meeting, timeEnd: timeToMinutes(t) })}
			/>
		</div>

		<div className="flex w-full items-end gap-2">
			<div className="w-full">
				{(meeting.location === undefined) && <LinkButton className="flex items-center gap-1" onClick={() => onChange({ ...meeting, location: "" })}>
					<Plus size={16} /> Add Location
				</LinkButton>}
				{(meeting.location !== undefined) && <div className="flex w-full items-center">
					<Input label="Location" className="w-full" value={meeting.location ?? ""} onChange={v => onChange({ ...meeting, location: v })} />
					<X className="text-gray-400 cursor-pointer" onClick={() => onChange({ ...meeting, location: undefined })} />
				</div>}

				{(meeting.instructor === undefined) && <LinkButton className="flex items-center gap-1" onClick={() => onChange({ ...meeting, instructor: "" })}>
					<Plus size={16} /> Add Instructor
				</LinkButton>}
				{(meeting.instructor !== undefined) && <div className="flex w-full items-center">
					<Input label="Instructor" placeholder="First Last" className="w-full" value={meeting.instructor ?? ""} onChange={v => onChange({ ...meeting, instructor: v })} />
					<X className="text-gray-400 cursor-pointer" onClick={() => onChange({ ...meeting, instructor: undefined })} />
				</div>}
			</div>
			<Trash2 size={28} className="p-2 box-content cursor-pointer hover:bg-bg-light text-danger" onClick={onDelete} />
		</div>
	</div>;
}
