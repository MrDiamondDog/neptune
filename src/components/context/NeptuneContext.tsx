"use client";

import { Course, Meeting, Task } from "@/db/types"
import { CoursesAction, coursesReducer } from "./courses";
import { MeetingsAction, meetingsReducer } from "./meetings";
import { ActionDispatch, createContext, useContext, useEffect, useReducer } from "react";
import { exampleCourses, exampleMeetings } from "@/example-data";

export type NeptuneData = {
	courses: Course[],
	meetings: Meeting[],
	tasks: Task[],
}

// Currently uses default data from example-data.ts. This file is gitignored as it contains my schedule from my uni.
export const defaultNeptuneData: NeptuneData = {
	courses: exampleCourses,
	meetings: exampleMeetings,
	tasks: [],
}

export type ContextAction = CoursesAction | MeetingsAction;

export function reducer(data: NeptuneData, action: ContextAction): NeptuneData {
	switch (action.context) {
		case "courses": {
			return { ...data, courses: coursesReducer(data.courses, action) }
		}
		case "meetings": {
			return { ...data, meetings: meetingsReducer(data.meetings, action) }
		}
		default: {
			console.error("Unknown context", action);
			return data;
		}
	}
}

export const NeptuneContext = createContext<NeptuneData>(defaultNeptuneData);
export const NeptuneDispatchContext = createContext<ActionDispatch<[ContextAction]> | null>(null);

export function NeptuneProvider({ children }: React.PropsWithChildren) {
	const [data, dispatch] = useReducer(reducer, defaultNeptuneData);

	useEffect(() => {

	}, []);

	return (<NeptuneContext value={data}>
		<NeptuneDispatchContext value={dispatch}>
			{children}
		</NeptuneDispatchContext>
	</NeptuneContext>);
}

export function useApp(): NeptuneData {
	return useContext(NeptuneContext);
}

export function useAppDispatch(): ActionDispatch<[ContextAction]> {
	return useContext(NeptuneDispatchContext)!;
}
