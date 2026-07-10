import { coursesTable, meetingsTable, tasksTable, termsTable, usersTable } from "./schema";

export type User = typeof usersTable.$inferSelect;
export type Term = typeof termsTable.$inferSelect;
export type Course = typeof coursesTable.$inferSelect;
export type Meeting = typeof meetingsTable.$inferSelect;
export type Task = typeof tasksTable.$inferSelect;

export type TermInsert = Omit<typeof termsTable.$inferInsert, "userId">;
export type CourseInsert = Omit<typeof coursesTable.$inferInsert, "userId">;
export type MeetingInsert = Omit<typeof meetingsTable.$inferInsert, "userId">;
export type TaskInsert = Omit<typeof tasksTable.$inferInsert, "userId">;
