import { coursesTable, meetingsTable, tasksTable, usersTable } from "./schema";

export type User = typeof usersTable.$inferSelect;
export type Course = typeof coursesTable.$inferSelect;
export type Meeting = typeof meetingsTable.$inferSelect;
export type Task = typeof tasksTable.$inferSelect;
