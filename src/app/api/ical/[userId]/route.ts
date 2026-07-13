import { eq } from "drizzle-orm";
import ical, { ICalEventBusyStatus, ICalEventRepeatingFreq, ICalEventTransparency, ICalWeekday } from "ical-generator";
import { NextRequest, NextResponse } from "next/server";

import { coursesTable, db, meetingsTable,termsTable } from "@/db/schema";
import { sortDaysOfWeek } from "@/lib/meetings";

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
	const { userId } = await ctx.params;

	const terms = await db.select().from(termsTable).where(eq(termsTable.userId, userId));
	const courses = await db.select().from(coursesTable).where(eq(coursesTable.userId, userId));
	const meetings = await db.select().from(meetingsTable).where(eq(meetingsTable.userId, userId));

	const calendar = ical();

	meetings.forEach(meeting => {
		const course = courses.find(c => c.id === meeting.courseId)!;
		const term = terms.find(t => t.id === course.termId)!;

		const meetingDays = sortDaysOfWeek(meeting.days);

		// Term start time + the day of week to position the first event correctly + start time.
		const recurStartTime = new Date(term.start.getTime() + (1000 * 60 * 60 * 24 * daysOfWeek.indexOf(meetingDays[0])) + (meeting.timeStart * 1000 * 60));

		// Converts meeting days to ical format
		const recurByDay = [...meetingDays].map(d => icalDaysOfWeek[d as keyof typeof icalDaysOfWeek]);

		calendar.createEvent({
			summary: course.name,
			start: recurStartTime,
			// Start time + duration in minutes
			end: new Date(recurStartTime.getTime() + 1000 * 60 * (meeting.timeEnd - meeting.timeStart)),
			timezone: "America/Denver",
			repeating: {
				freq: ICalEventRepeatingFreq.WEEKLY,
				startOfWeek: ICalWeekday.SU,
				until: term.end,
				byDay: recurByDay as ICalWeekday[],
			},
			busystatus: ICalEventBusyStatus.BUSY,
			transparency: ICalEventTransparency.OPAQUE,
		});
	});

	return new NextResponse(calendar.toString());
}
