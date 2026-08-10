"use client";

import { ActionDispatch, createContext, useContext, useEffect, useReducer } from "react";

import { getCourses } from "@/app/actions/courses";
import { getAllMeetings } from "@/app/actions/meetings";
import { getTasks } from "@/app/actions/tasks";
import { getTerms } from "@/app/actions/terms";
import { Course, Meeting, Task, Term } from "@/db/types";


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

export type UnknownAction = { context: string, type: "create" | "edit" | "delete" | "set", data: any };

export type ContextAction<T extends { id: string }> =
	{ context: string, type: "create", data: T } |
	{ context: string, type: "edit", data: Partial<T> & { id: string } } |
	{ context: string, type: "delete", data: string } |
	{ context: string, type: "set", data: T[] };

export function defaultReducer<T extends { id: string }>(data: T[], action: ContextAction<T>): T[] {
	switch (action.type) {
		case "create": {
			return [...data, action.data];
		}
		case "edit": {
			return [...data.filter(t => t.id !== action.data.id), { ...data.find(t => t.id === action.data.id), ...action.data } as T];
		}
		case "set": {
			return action.data;
		}
		case "delete": {
			return data.filter(t => t.id !== action.data);
		}
		default: {
			return data;
		}
	}
}

export function reducer(data: NeptuneData, action: UnknownAction): NeptuneData {
	switch (action.context) {
		case "courses": {
			return { ...data, courses: defaultReducer<Course>(data.courses, action) };
		}
		case "meetings": {
			return { ...data, meetings: defaultReducer<Meeting>(data.meetings, action) };
		}
		case "terms": {
			return { ...data, terms: defaultReducer<Term>(data.terms, action) };
		}
		case "tasks": {
			return { ...data, tasks: defaultReducer<Task>(data.tasks, action) };
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
		// dispatch({ context: "courses", type: "set", data: exampleCourses });
		// dispatch({ context: "meetings", type: "set", data: exampleMeetings });
		// dispatch({ context: "terms", type: "set", data: exampleTerms });
	}, []);

	return (<NeptuneContext value={{ ...data, dispatch }}>
		{children}
	</NeptuneContext>);
}

export function useApp(): NeptuneData {
	return useContext(NeptuneContext);
}
