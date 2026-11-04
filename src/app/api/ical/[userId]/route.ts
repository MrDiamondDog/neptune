
import { eq } from "drizzle-orm";
import ical, { ICalEventBusyStatus, ICalEventRepeatingFreq, ICalEventTransparency, ICalWeekday } from "ical-generator";
import { NextRequest, NextResponse } from "next/server";

import { coursesTable, db, meetingsTable,termsTable, usersTable } from "@/db/schema";
import { getUniqueInstructors, getUniqueLocations, minutesToTime, prettyDaysOfWeek } from "@/lib/meetings";
import { epochToTemporal, rruleDaysOfWeek, sortDaysOfWeek } from "@/lib/time";

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
		timezone: user.timezone
	});

	meetings.forEach(meeting => {
		const course = courses.find(c => c.id === meeting.courseId)!;
		const allCourseMeetings = meetings.filter(m => m.courseId === course.id);
		const term = terms.find(t => t.id === course.termId)!;

		const meetingDays = sortDaysOfWeek(meeting.days);

		const recurStartTime = epochToTemporal(term.start)
			.add({ minutes: meeting.timeStart });

		// Converts meeting days to ical format
		const recurByDay = [...meetingDays].map(d => rruleDaysOfWeek[d as keyof typeof rruleDaysOfWeek]);

		let description = `${course.subject}${course.number}\n`;

		const uniqueInstructors = getUniqueInstructors(allCourseMeetings);
		const uniqueLocations = getUniqueLocations(allCourseMeetings);

		if (uniqueInstructors.length === 1)
			description += `${uniqueInstructors[0]}\n`;
		if (uniqueLocations.length === 1)
			description += `${uniqueLocations[0]}\n`;

		allCourseMeetings.forEach(m => description +=
			`${prettyDaysOfWeek(m.days)} | ${minutesToTime(m.timeStart, "12")} - ${minutesToTime(m.timeEnd, "12")} ` +
			(uniqueLocations.length > 1 ? `| ${m.location} ` : "") +
			(uniqueInstructors.length > 1 ? `| ${m.instructor} ` : "") + "\n"
		);

		const exclusions = (Array.isArray(meeting.exclusions) ? meeting.exclusions : [])
			.map(e => epochToTemporal(e));

		calendar.createEvent({
			summary: course.name,
			start: recurStartTime,
			// Start time + duration in minutes
			end: recurStartTime.add({ minutes: meeting.timeEnd - meeting.timeStart }),
			repeating: {
				freq: ICalEventRepeatingFreq.WEEKLY,
				startOfWeek: ICalWeekday.SU,
				until: epochToTemporal(term.end),
				byDay: recurByDay as ICalWeekday[],
				exclude: exclusions.length ? exclusions : undefined,
				interval: 1
			},
			busystatus: ICalEventBusyStatus.BUSY,
			transparency: ICalEventTransparency.OPAQUE,
			location: meeting.location ?? undefined,
			description: description.trim(),
			timezone: null
		});
	});

	return new NextResponse(calendar.toString());
}
