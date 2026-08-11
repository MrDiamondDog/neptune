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
