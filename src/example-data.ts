import { Course, Meeting, Term } from "./db/types";

function course(id: string, name: string, subject: string, number: string, color: string, creditHours?: number, type?: string): Course {
	return {
		id,
		userId: "0",
		name,
		number,
		subject,
		termId: "50",
		creditHours: creditHours ?? null,
		type: type ?? null,
		color,
	};
}

function meeting(course: string, days: string, timeStart: string, timeEnd: string, instructor?: string, location?: string): Meeting {
	let startMins = 0;
	let endMins = 0;

	startMins += parseInt(timeStart.split(":")[0]) * 60 - new Date().getTimezoneOffset();
	startMins += parseInt(timeStart.split(":")[1]);
	endMins += parseInt(timeEnd.split(":")[0]) * 60 - new Date().getTimezoneOffset();
	endMins += parseInt(timeEnd.split(":")[1]);

	return {
		id: `${Math.floor(Math.random() * 10000)}`,
		userId: "0",
		courseId: course,
		days,
		timeStart: startMins,
		timeEnd: endMins,
		instructor: instructor ?? null,
		location: location ?? null,
		exclusions: [],
	};
}

export const exampleTerms: Term[] = [
	{
		id: "50",
		userId: "0",
		year: 2026,
		season: "fall",
		start: new Date(2026, 6, 9),
		end: new Date(2030, 4, 18),
	}
];

export const exampleCourses: Course[] = [
	course("1", "Data Structures", "CS", "164", "#00aaff", 4),
	course("2", "Data Structures - Lab", "CS", "164-L", "#00aadd", 0, "lab"),
	course("3", "Plants and Civilizations", "AGRI", "115", "#00ff00", 3),
	course("4", "Plants and Civilizations - Recitation", "AGRI", "115-R", "#00dd00", 0, "recitation"),
	course("5", "First-Year Seminar - CS", "CS", "191", "#ff00ff", 0, "seminar"),
	course("6", "Economics to Combat Climate Change", "ECON", "242", "#ffff00", 3),
	course("7", "Math for Computer Science", "MATH", "157", "#ff0000", 4),
];

export const exampleMeetings: Meeting[] = [
	meeting("1", "MFW", "9:00", "9:50", undefined, "Stadium"),
	meeting("2", "RT", "14:45", "15:50", undefined, "Comp Sci. Building"),
	meeting("3", "WM", "16:00", "16:50", undefined, "Nutrients Building"),
	meeting("4", "F", "14:00", "14:50", undefined, "Plant Science Building"),
	meeting("5", "T", "16:00", "17:50", undefined, "Stadium"),
	meeting("5", "R", "9:00", "9:50", undefined, "Weber Building"),
	meeting("6", "TR", "11:30", "12:45", undefined, "Clark Building"),
	meeting("7", "WFMT", "10:00", "10:50", undefined, "Engineering Building"),
];
