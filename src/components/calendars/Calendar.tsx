"use client";

import { DateInput, DurationInput, EventClickArg, EventContentArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import FullCalendar from "@fullcalendar/react";
import rrulePlugin from "@fullcalendar/rrule";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";

import { Course } from "@/db/types";
import { MINUTES, prettyTime, prettyTimeRange } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import CourseInline from "../courses/CourseInline";
import MeetingsInline from "../meetings/MeetingsInline";
import Portal from "../primitives/Portal";
import Subtext from "../primitives/Subtext";

export type CalendarEvent = {
	id?: string;
	title: string;
	start: DateInput;
	end: DateInput;
	allDay?: boolean;
	color?: string;
	borderColor?: string;
};

export type RecurringEvent = {
	id?: string;
	title: string;
	allDay?: boolean;
	duration: DurationInput;
	color?: string;
	borderColor?: string;
	// I don't know what type FullCalendar is expecting here
	rrule: object;
	exdate?: DateInput[]
};

function getEventText(props: EventContentArg) {
	if (props.event.allDay || !props.event.start || !props.event.end)
		return `<div class="text-xs!">${props.event.title}</div>`;

	const duration = (props.event.end.getTime() - props.event.start.getTime()) / MINUTES;
	const monthViewDot = props.view.type === "dayGridMonth" ? `<div class="min-w-1.5 min-h-1.5 rounded-full mr-0.5" style="background-color: ${props.event.borderColor}"></div>` : "";

	if (duration <= 30 || props.view.type === "dayGridMonth")
		return `${monthViewDot}${prettyTime(props.event.start).replace(":00", "")} <b class="text-[10px]! overflow-hidden">${props.event.title}</b>`;
	else
		return `<p class="text-[10px]! overflow-hidden">${monthViewDot}${prettyTimeRange(props.event.start, props.event.end).replaceAll(":00", "")}\n<b class="text-[10px]! overflow-hidden">${props.event.title}</b></p>`;
}

export default function Calendar({ events }: { events: (CalendarEvent | RecurringEvent)[] }) {
	const { courses, meetings } = useApp();

	const [selectedEvent, setSelectedEvent] = useState<EventClickArg>();
	const [selectedCourse, setSelectedCourse] = useState<Course>();

	useEffect(() => {
		if (!selectedEvent || selectedEvent.event.id.startsWith("ical-"))
			return void setSelectedCourse(undefined);

		const newMeeting = meetings.find(m => m.id === selectedEvent.event.id);
		if (!newMeeting)
			return;

		setSelectedCourse(courses.find(c => c.id === newMeeting.courseId));
	}, [selectedEvent, meetings, courses]);

	return <>
		<FullCalendar
			plugins={[timeGridPlugin, dayGridPlugin, iCalendarPlugin, rrulePlugin]}
			initialView="timeGridWeek"
			editable={false}
			eventClassNames="rounded-none! cursor-pointer"
			eventContent={props => ({
				html: `<div class="leading-3.25 text-[10px]! whitespace-pre-wrap *:text-nowrap! overflow-hidden text-ellipsis! flex items-center">${getEventText(props)}</div>`
			})}
			events={events}
			scrollTime="7:00"
			allDaySlot={events.findIndex(e => e.allDay) !== -1}
			nowIndicator
			headerToolbar={{
				left: "title",
				right: "prev,next,dayGridMonth,timeGridWeek",
			}}
			eventClick={e => setSelectedEvent(e)}
		/>

		{selectedEvent && <Portal>
			<div className="absolute inset-0 z-10" onClick={() => setSelectedEvent(undefined)} />
			<div className="absolute z-20 bg-bg-lighter p-2 drop-shadow-lg border-2 border-bg-lightest" style={{
				left: `${selectedEvent.el.getBoundingClientRect().x + selectedEvent.el.clientWidth}px`,
				top: `${selectedEvent.el.getBoundingClientRect().y + window.scrollY}px`
			}}>
				{!selectedEvent.event.id.startsWith("ical-") ? <>
					{selectedCourse && <CourseInline course={selectedCourse} day={selectedEvent.event.start} meetingId={selectedEvent.event.id} />}
					{selectedCourse && <MeetingsInline meetings={meetings.filter(m => m.courseId === selectedCourse.id)} />}
				</> : <>
					<p className="font-bold">{selectedEvent.event.title}</p>
					{selectedEvent.event.start && selectedEvent.event.end &&
						<p>
							{/* I hate timezones */}
							{prettyTimeRange(
								new Date(selectedEvent.event.start.getTime()),
								new Date(selectedEvent.event.end.getTime())
							)}
						</p>
					}
					<Subtext>From iCal</Subtext>
				</>}
			</div>
		</Portal>}
	</>;
}
