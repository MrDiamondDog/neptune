import { Meeting } from "@/db/types";
import { minutesToTime, prettyDaysOfWeek, sortDaysOfWeek } from "@/lib/meetings";

export default function MeetingsInline({ meetings }: { meetings: Meeting[] }) {
	// Gets a list of all the unique instructors among the meetings to change how it is displayed if there is one.
	// Also reverses the name to "Last, First"
	const uniqueInstructors = meetings.map(m => m.instructor).filter(p => p !== null)
		.reduce((prev, curr) => (!prev.includes(curr) ? [...prev, curr] : prev), [] as string[])
		.map(i => i.split(" ").reverse().join(", "))
	// Same as above, but for location.
	const uniqueLocations = meetings.map(m => m.location).filter(l => l !== null)
		.reduce((prev, curr) => (!prev.includes(curr) ? [...prev, curr] : prev), [] as string[])

	return <>
		{uniqueInstructors.length === 1 && <p>{uniqueInstructors[0]}</p>}
		{uniqueLocations.length === 1 && <p>{uniqueLocations[0]}</p>}
		{meetings.map(meeting => <p key={meeting.id}>
			{prettyDaysOfWeek(meeting.days)} | {minutesToTime(meeting.timeStart)} - {minutesToTime(meeting.timeEnd)}{" "}
			{uniqueLocations.length > 1 && `| ${meeting.location}`}{" "}
			{uniqueInstructors.length > 1 && `| ${meeting.instructor}`}
		</p>)}
	</>
}
