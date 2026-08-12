"use client";

import { DateInput, DurationInput, EventClickArg, EventContentArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import FullCalendar from "@fullcalendar/react";
import rrulePlugin from "@fullcalendar/rrule";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";

import { Course, Task } from "@/db/types";
import { MINUTES, prettyTime, prettyTimeRange } from "@/lib/time";

import { useApp } from "../context/NeptuneContext";
import CourseInline from "../courses/CourseInline";
import MeetingsInline from "../meetings/MeetingsInline";
import Portal from "../primitives/Portal";
import Subtext from "../primitives/Subtext";
import TaskPopover from "../tasks/TaskPopover";

export type CalendarEvent = {
	id?: string;
	title: string;
	start: DateInput;
	end?: DateInput;
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
	rrule: string;
	exdate?: DateInput[]
};

function getEventText(props: EventContentArg) {
	if (props.event.allDay || !props.event.start || !props.event.end)
		return `<div class="text-xs!">${props.event.title}</div>`;

	const duration = (props.event.end.getTime() - props.event.start.getTime()) / MINUTES;
	const start = new Date(props.event.start.getTime() + props.event.start.getTimezoneOffset() * MINUTES);
	const end = new Date(props.event.end.getTime() + props.event.end.getTimezoneOffset() * MINUTES);
	const monthViewDot = props.view.type === "dayGridMonth" ? `<div class="min-w-1.5 min-h-1.5 rounded-full mr-0.5" style="background-color: ${props.event.borderColor}"></div>` : "";

	if (duration <= 30 || props.view.type === "dayGridMonth")
		return `${monthViewDot}${prettyTime(start).replace(":00", "")} <b class="text-[10px]! overflow-hidden">${props.event.title}</b>`;
	else
		return `<p class="text-[10px]! overflow-hidden">${monthViewDot}${prettyTimeRange(start, end).replaceAll(":00", "")}\n<b class="text-[10px]! overflow-hidden">${props.event.title}</b></p>`;
}

export default function Calendar({ events }: { events: (CalendarEvent | RecurringEvent)[] }) {
	const { courses, meetings, tasks } = useApp();

	const [selectedEvent, setSelectedEvent] = useState<EventClickArg>();
	const [selectedItem, setSelectedItem] = useState<Course | Task>();

	useEffect(() => {
		if (!selectedEvent || selectedEvent.event.id.startsWith("ical-"))
			return void setSelectedItem(undefined);

		if (selectedEvent.event.id.startsWith("meeting-")) {
			const meeting = meetings.find(m => m.id === selectedEvent.event.id.replace("meeting-", ""));
			if (!meeting)
				return;

			setSelectedItem(courses.find(c => c.id === meeting.courseId));
		} else if (selectedEvent.event.id.startsWith("task-"))
			setSelectedItem(tasks.find(t => t.id === selectedEvent.event.id.replace("task-", "")));
	}, [selectedEvent, meetings, courses, tasks]);

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
				right: "today,prev,next,dayGridMonth,timeGridWeek",
			}}
			eventClick={e => setSelectedEvent(e)}
			// idk what fullcalendar is doing behind the scenes but this fixes all the timezone issues
			timeZone=""
		/>

		{selectedEvent && <Portal>
			<div className="fixed inset-0 z-10" onClick={() => setSelectedEvent(undefined)} />
			<div className="absolute z-20 bg-bg-light p-2 drop-shadow-lg border-2 border-bg-lighter" style={{
				left: `${selectedEvent.el.getBoundingClientRect().x + selectedEvent.el.clientWidth}px`,
				top: `${selectedEvent.el.getBoundingClientRect().y + window.scrollY}px`
			}}>
				{selectedEvent.event.id.startsWith("meeting-") && <>
					{selectedItem && <CourseInline course={selectedItem as Course} day={selectedEvent.event.start} meetingId={selectedEvent.event.id.replace("meeting-", "")} />}
					{selectedItem && <MeetingsInline meetings={meetings.filter(m => m.courseId === selectedItem.id)} />}
				</>}
				{selectedEvent.event.id.startsWith("ical-") && <>
					<p className="font-bold">{selectedEvent.event.title}</p>
					{selectedEvent.event.start && selectedEvent.event.end &&
						<p>
							{/* I hate timezones */}
							{prettyTimeRange(
								new Date(selectedEvent.event.start.getTime() + selectedEvent.event.start.getTimezoneOffset() * MINUTES),
								new Date(selectedEvent.event.end.getTime() + selectedEvent.event.start.getTimezoneOffset() * MINUTES)
							)}
						</p>
					}
					<Subtext>From iCal</Subtext>
				</>}
				{selectedEvent.event.id.startsWith("task") && <>
					<TaskPopover task={selectedItem as Task} />
				</>}
			</div>
		</Portal>}
	</>;
}
