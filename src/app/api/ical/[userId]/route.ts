import { eq } from "drizzle-orm";
import ical, { ICalEventBusyStatus, ICalEventRepeatingFreq, ICalEventTransparency, ICalWeekday } from "ical-generator";
import { NextRequest, NextResponse } from "next/server";

import { coursesTable, db, meetingsTable,termsTable, usersTable } from "@/db/schema";
import { getUniqueInstructors, getUniqueLocations, minutesToTime, prettyDaysOfWeek, sortDaysOfWeek } from "@/lib/meetings";
import { DAYS, MINUTES, toUTCDate } from "@/lib/time";

const daysOfWeek = [..."UMTWRFS"];
const icalDaysOfWeek = {
	U: "SU",
	M: "MO",
	T: "TU",
	W: "WE",
	R: "TH",
	F: "FR",
	S: "SA"
};

/**
 * This API route responds with a valid iCal file to use within other calendar apps.
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/ical/[userId]">) {
	const params = await ctx.params;
	const userId = params.userId.replace(".ics", "");

	const user = (await db.select().from(usersTable).where(eq(usersTable.id, userId)))[0];

	if (!user)
		return new NextResponse("User not found", { status: 404 });

	const terms = await db.select().from(termsTable).where(eq(termsTable.userId, userId));
	const courses = await db.select().from(coursesTable).where(eq(coursesTable.userId, userId));
	const meetings = await db.select().from(meetingsTable).where(eq(meetingsTable.userId, userId));

	const calendar = ical({
		name: "Neptune",
	});

	meetings.forEach(meeting => {
		const course = courses.find(c => c.id === meeting.courseId)!;
		const allCourseMeetings = meetings.filter(m => m.courseId === course.id);
		const term = terms.find(t => t.id === course.termId)!;

		const meetingDays = sortDaysOfWeek(meeting.days);

		// Term start time + the day of week to position the first event correctly + start time.
		const recurStartTime = new Date(
			term.start.getTime() +
			(DAYS * daysOfWeek.indexOf(meetingDays[0])) +
			(meeting.timeStart * MINUTES)
		);

		// Converts meeting days to ical format
		const recurByDay = [...meetingDays].map(d => icalDaysOfWeek[d as keyof typeof icalDaysOfWeek]);

		let description = `${course.subject}${course.number}\n`;

		const uniqueInstructors = getUniqueInstructors(allCourseMeetings);
		const uniqueLocations = getUniqueLocations(allCourseMeetings);

		if (uniqueInstructors.length === 1)
			description += `${uniqueInstructors[0]}\n`;
		if (uniqueLocations.length === 1)
			description += `${uniqueLocations[0]}\n`;

		allCourseMeetings.forEach(m => description +=
			`${prettyDaysOfWeek(m.days)} | ${minutesToTime(m.timeStart)} - ${minutesToTime(m.timeEnd)} ` +
			(uniqueLocations.length > 1 ? `| ${m.location} ` : "") +
			(uniqueInstructors.length > 1 ? `| ${m.instructor} ` : "") + "\n"
		);

		calendar.createEvent({
			summary: course.name,
			start: new Date(toUTCDate(recurStartTime).getTime() + (user.timezoneOffset * MINUTES)),
			// Start time + duration in minutes
			end: new Date(toUTCDate(new Date(recurStartTime.getTime() + MINUTES * (meeting.timeEnd - meeting.timeStart))).getTime() + (user.timezoneOffset * MINUTES)),
			repeating: {
				freq: ICalEventRepeatingFreq.WEEKLY,
				startOfWeek: ICalWeekday.SU,
				until: term.end,
				byDay: recurByDay as ICalWeekday[],
			},
			busystatus: ICalEventBusyStatus.BUSY,
			transparency: ICalEventTransparency.OPAQUE,
			location: meeting.location ?? undefined,
			description: description.trim()
		});
	});

	return new NextResponse(calendar.toString());
}
