import { Optional } from "@/lib/types";

import { coursesTable, flashcardsTable, meetingsTable, studySessionsTable, tasksTable, termsTable, usersTable } from "./schema";

export type User = Optional<typeof usersTable.$inferSelect, "password">;
export type Term = typeof termsTable.$inferSelect;
export type Course = typeof coursesTable.$inferSelect;
export type Meeting = typeof meetingsTable.$inferSelect;
export type Task = typeof tasksTable.$inferSelect;
export type StudySession = typeof studySessionsTable.$inferSelect;
export type Flashcard = typeof flashcardsTable.$inferSelect;

export type TermInsert = Omit<typeof termsTable.$inferInsert, "userId">;
export type CourseInsert = Omit<typeof coursesTable.$inferInsert, "userId">;
export type MeetingInsert = Omit<typeof meetingsTable.$inferInsert, "userId">;
export type TaskInsert = Omit<typeof tasksTable.$inferInsert, "userId">;
export type StudySessionInsert = Omit<typeof studySessionsTable.$inferInsert, "userId">;
export type FlashcardInsert = Omit<typeof flashcardsTable.$inferInsert, "userId">;

export type UserNotificationKeys = "courses" | "tasks" | "exams" | "morning-overview" | "evening-overview";
export type UserNotificationSettings = Record<UserNotificationKeys, boolean>;
export const defaultNotificationSettings: UserNotificationSettings = {
	courses: false,
	tasks: false,
	exams: false,
	"morning-overview": false,
	"evening-overview": false
};

export const notificationKeys: { key: UserNotificationKeys, name: string, subtext: string }[] = [
	{ key: "courses", name: "Course Reminders", subtext: "Receive a reminder 15 minutes before a class." },
	{ key: "tasks", name: "Task Reminders", subtext: "A task reminder after your last class of the day, and when an incomplete task is about to be due." },
	{ key: "exams", name: "Exams", subtext: "Study reminders and good wishes for exams." },
	{ key: "morning-overview", name: "Morning Overview", subtext: "Receive an overview of your day at 7am." },
	{ key: "evening-overview", name: "Evening Overview", subtext: "Receive an overview of tomorrow at 9pm." }
];
