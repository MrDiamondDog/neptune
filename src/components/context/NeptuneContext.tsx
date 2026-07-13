"use client";

import { ActionDispatch, createContext, useContext, useEffect, useReducer } from "react";

import { getCourses } from "@/app/actions/courses";
import { getAllMeetings } from "@/app/actions/meetings";
import { getTasks } from "@/app/actions/tasks";
import { getTerms } from "@/app/actions/terms";
import { Course, Meeting, Task, Term } from "@/db/types";

import { CoursesAction, coursesReducer } from "./courses";
import { MeetingsAction, meetingsReducer } from "./meetings";
import { TasksAction, tasksReducer } from "./tasks";
import { TermsAction, termsReducer } from "./terms";

export type NeptuneData = {
	courses: Course[],
	meetings: Meeting[],
	terms: Term[],
	tasks: Task[],

	dispatch: ActionDispatch<[ContextAction]>,
};

// Currently uses default data from example-data.ts. This file is gitignored as it contains my schedule from my uni.
export const defaultNeptuneData: NeptuneData = {
	courses: [],
	meetings: [],
	terms: [],
	tasks: [],

	dispatch: () => { throw "Dispatch called outside of NeptuneProvider."; },
};

export type ContextAction = CoursesAction | MeetingsAction | TermsAction | TasksAction;

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
		case "tasks": {
			return { ...data, tasks: tasksReducer(data.tasks, action) };
		}
		default: {
			console.error("Unknown context", action);
			return data;
		}
	}
}

export const NeptuneContext = createContext<NeptuneData>(defaultNeptuneData);

export function NeptuneProvider({ children }: React.PropsWithChildren) {
	const [data, dispatch] = useReducer(reducer, defaultNeptuneData);

	useEffect(() => {
		getCourses().then(data => dispatch({ context: "courses", type: "set", data }));
		getAllMeetings().then(data => dispatch({ context: "meetings", type: "set", data }));
		getTerms().then(data => dispatch({ context: "terms", type: "set", data }));
		getTasks().then(data => dispatch({ context: "tasks", type: "set", data }));
	}, []);

	return (<NeptuneContext value={{ ...data, dispatch }}>
		{children}
	</NeptuneContext>);
}

export function useApp(): NeptuneData {
	return useContext(NeptuneContext);
}
