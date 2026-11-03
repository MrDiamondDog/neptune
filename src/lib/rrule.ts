
import { Meeting, Term } from "@/db/types";

import { dayOrder, epochToTemporal, rruleDaysOfWeek, sortDaysOfWeek, temporalToIcalString } from "./time";

export function meetingToRRule(term: Term, meeting: Meeting) {
	let byweekday: string[] = [];
	byweekday = [...sortDaysOfWeek(meeting.days)].map(d => rruleDaysOfWeek[d as keyof typeof rruleDaysOfWeek]);

	const dayOffset = dayOrder.indexOf(sortDaysOfWeek(meeting.days)[0]);
	const firstMeeting = epochToTemporal(term.start)
		.add({ days: dayOffset })
		.add({ minutes: meeting.timeStart });

	const rrule: Record<string, string> = {
		"FREQ": "WEEKLY",
		"INTERVAL": "1",
		"WKST": "SU",
		"UNTIL": temporalToIcalString(epochToTemporal(term.end)),
		"BYDAY": byweekday.join(","),
		"DTSTART": temporalToIcalString(firstMeeting)
	};

	return Object.keys(rrule).map(key => `${key}=${rrule[key]}`).join(";");
}
