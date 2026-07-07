"use client";

import { DateInput, DurationInput, EventClickArg } from "@fullcalendar/core/index.js";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";
import Portal from "../primitives/Portal";
import { useApp } from "../context/NeptuneContext";
import { Course, Meeting } from "@/db/types";
import CourseInline from "../courses/CourseInline";
import MeetingsInline from "../meetings/MeetingsInline";

export type CalendarEvent = {
	id?: string;
	title: string;
	start: DateInput;
	end: DateInput;
	allDay?: boolean;
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

export default function WeeklyCalendar({ events }: { events: (CalendarEvent | RecurringEvent)[] }) {
	const { courses, meetings } = useApp();

	const [selectedEvent, setSelectedEvent] = useState<EventClickArg>();
	const [selectedCourse, setSelectedCourse] = useState<Course>();

	useEffect(() => {
		if (!selectedEvent) {
			setSelectedCourse(undefined);
			return;
		}

		const newMeeting = meetings.find(m => m.id === selectedEvent.event.id);
		if (!newMeeting)
			return;
		setSelectedCourse(courses.find(c => c.id === newMeeting.courseId));
	}, [selectedEvent])

	return <>
		<FullCalendar
			plugins={[timeGridPlugin]}
			initialView="timeGridWeek"
			editable={false}
			events={events}
			scrollTime="7:00"
			allDaySlot={events.findIndex(e => e.allDay) === -1 ? false : true}
			nowIndicator
			headerToolbar={{
				left: "title",
				right: "prev,next",
			}}
			eventClick={e => setSelectedEvent(e)}
		/>

		{selectedEvent && <Portal>
			<div className="absolute inset-0 z-10" onClick={() => setSelectedEvent(undefined)} />
			<div className="absolute z-20 bg-bg-lighter p-2 drop-shadow-lg border-2 border-bg-lightest" style={{
				left: `${selectedEvent.el.getBoundingClientRect().x + selectedEvent.el.clientWidth}px`,
				top: `${selectedEvent.el.getBoundingClientRect().y + window.scrollY}px`
			}}>
				{selectedCourse && <CourseInline course={selectedCourse} />}
				{selectedCourse && <MeetingsInline meetings={meetings.filter(m => m.courseId === selectedCourse.id)} />}
			</div>
		</Portal>}
	</>
}
