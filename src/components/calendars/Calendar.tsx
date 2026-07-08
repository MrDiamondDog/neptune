"use client";

import { DateInput, DurationInput, EventClickArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";

import { Course } from "@/db/types";
import { prettyTimeRange } from "@/lib/time";

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
};

export type RecurringEvent = {
	id?: string;
	title: string;
	daysOfWeek: number[];
	allDay?: boolean;
	startTime?: DurationInput;
	endTime?: DurationInput;
	startRecur: DateInput;
	endRecur: DateInput;
};

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
			plugins={[timeGridPlugin, dayGridPlugin, iCalendarPlugin]}
			initialView="timeGridWeek"
			editable={false}
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

		{(selectedEvent) && <Portal>
			<div className="absolute inset-0 z-10" onClick={() => setSelectedEvent(undefined)} />
			<div className="absolute z-20 bg-bg-lighter p-2 drop-shadow-lg border-2 border-bg-lightest" style={{
				left: `${selectedEvent.el.getBoundingClientRect().x + selectedEvent.el.clientWidth}px`,
				top: `${selectedEvent.el.getBoundingClientRect().y + window.scrollY}px`
			}}>
				{!selectedEvent.event.id.startsWith("ical-") ? <>
					{selectedCourse && <CourseInline course={selectedCourse} />}
					{selectedCourse && <MeetingsInline meetings={meetings.filter(m => m.courseId === selectedCourse.id)} />}
				</> : <>
					<p className="font-bold">{selectedEvent.event.title}</p>
					<p>{prettyTimeRange(selectedEvent.event.start!, selectedEvent.event.end!)}</p>
					<Subtext>From iCal</Subtext>
				</>}
			</div>
		</Portal>}
	</>;
}
