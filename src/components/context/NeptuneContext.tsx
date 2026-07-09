"use client";

import { ActionDispatch, createContext, useContext, useEffect, useReducer } from "react";

import { getCourses } from "@/app/actions/courses";
import { getAllMeetings } from "@/app/actions/meetings";
import { getTerms } from "@/app/actions/terms";
import { Course, Meeting, Task, Term } from "@/db/types";
import { exampleCourses, exampleMeetings, exampleTasks, exampleTerms } from "@/example-data";

import { CoursesAction, coursesReducer } from "./courses";
import { MeetingsAction, meetingsReducer } from "./meetings";
import { TermsAction, termsReducer } from "./terms";

export type NeptuneData = {
	courses: Course[],
	meetings: Meeting[],
	terms: Term[],
	tasks: Task[],
};

// Currently uses default data from example-data.ts. This file is gitignored as it contains my schedule from my uni.
export const defaultNeptuneData: NeptuneData = {
	courses: exampleCourses,
	meetings: exampleMeetings,
	terms: exampleTerms,
	tasks: exampleTasks,
};

export type ContextAction = CoursesAction | MeetingsAction | TermsAction;

export function reducer(data: NeptuneData, action: ContextAction): NeptuneData {
	switch (action.context) {
		case "courses": {
			return { ...data, courses: coursesReducer(data.courses, action) };
		}
		case "meetings": {
			return { ...data, meetings: meetingsReducer(data.meetings, action) };
		}
		case "terms": {
			return { ...data, terms: termsReducer(data.terms, action) };
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
		getCourses().then(data => dispatch({ context: "courses", type: "set", data }));
		getAllMeetings().then(data => dispatch({ context: "meetings", type: "set", data }));
		getTerms().then(data => dispatch({ context: "terms", type: "set", data }));
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
	const dispatch = useContext(NeptuneDispatchContext);
	if (!dispatch)
		throw "No dispatch???";
	return dispatch;
}
