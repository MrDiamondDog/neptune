import { MeetingInsert } from "@/db/types";
import { getUniqueInstructors, getUniqueLocations, minutesToTime, prettyDaysOfWeek } from "@/lib/meetings";

export default function MeetingsInline({ meetings }: { meetings: MeetingInsert[] }) {
	const uniqueInstructors = getUniqueInstructors(meetings);
	const uniqueLocations = getUniqueLocations(meetings);

	return <>
		{uniqueInstructors.length === 1 && <p>{uniqueInstructors[0]}</p>}
		{uniqueLocations.length === 1 && <p>{uniqueLocations[0]}</p>}
		{meetings.map(meeting => <p key={meeting.id}>
			{prettyDaysOfWeek(meeting.days)} | {minutesToTime(meeting.timeStart)} - {minutesToTime(meeting.timeEnd)}{" "}
			{uniqueLocations.length > 1 && `| ${meeting.location}`}{" "}
			{uniqueInstructors.length > 1 && `| ${meeting.instructor}`}
		</p>)}
	</>;
}
