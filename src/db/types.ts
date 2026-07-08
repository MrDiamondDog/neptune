import { coursesTable, meetingsTable, tasksTable, termsTable, usersTable } from "./schema";

export type User = typeof usersTable.$inferSelect;
export type Term = typeof termsTable.$inferSelect;
export type Course = typeof coursesTable.$inferSelect;
export type Meeting = typeof meetingsTable.$inferSelect;
export type Task = typeof tasksTable.$inferSelect;

export type CourseInsert = typeof coursesTable.$inferInsert;
export type MeetingInsert = typeof meetingsTable.$inferInsert;
