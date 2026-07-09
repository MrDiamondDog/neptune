import { DateInput } from "@fullcalendar/core/index.js";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const client = createClient({
	url: "file:./data/neptune.db",
});
export const db = drizzle(client);

const id = {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID())
};

export const usersTable = sqliteTable("user", {
	...id,
	email: text("email")
		.unique(),
	password: text("password").notNull(),
	name: text("name").notNull(),

	icalUrl: text("icalUrl"),
});

export const termsTable = sqliteTable("term", {
	...id,
	userId: text("userId").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),

	// Ex. fall, spring, summer
	season: text("season").notNull(),
	year: integer("year").notNull(),

	// Start must be a Sunday.
	start: integer("start", { mode: "timestamp" }).notNull(),
	// End must be a Saturday.
	end: integer("end", { mode: "timestamp" }).notNull(),
});

// Represents a course. Each course is divided into sections.
export const coursesTable = sqliteTable("course", {
	...id,
	userId: text("userId").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
	// The term that this course is a part of.
	termId: text("termId").references(() => termsTable.id, { onDelete: "cascade" }).notNull(),

	// This course's formal name, ex. "Data Structures"
	name: text("name").notNull(),
	// Subject code for the course
	subject: text("subject").notNull(),
	// Course number (string for flexibility)
	number: text("number").notNull(),
	// The type of course, like lecture, lab, etc.
	// Could be an enum but should allow flexibility
	type: text("type"),
	// Optional input for number of credit hours for this course.
	creditHours: integer("creditHours"),
});

// Represents meeting times of a course. Each meeting can have different times, instructors, meeting days/times, etc. Most courses have one.
export const meetingsTable = sqliteTable("meeting", {
	...id,
	userId: text("userId").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
	courseId: text("courseId").references(() => coursesTable.id, { onDelete: "cascade" }).notNull(),

	// Days of the week this section is for. Formatted as a string, each char representing a day.
	// M = monday, T = tuesday, W = wednesday, R = thursday, F = friday, S = saturday, U = sunday
	// "MTW" = Monday, Tuesday, Wednesday
	days: text("days").notNull(),
	// Times are in minute of day, 0-1440.
	timeStart: integer("timeStart").notNull(),
	timeEnd: integer("timeEnd").notNull(),
	// Name of the instructor for this section
	instructor: text("instructor"),
	// Meeting location for this section
	location: text("location"),
	// A list of excluded dates this meeting will not happen on.
	exclusions: text("exclusions", { mode: "json" }).default("[]")
		.$type<DateInput[]>()
});

export const tasksTable = sqliteTable("task", {
	...id,
	userId: text("userId").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),

	title: text("title").notNull(),
	complete: integer("complete", { mode: "boolean" }).notNull().default(false),
	dueDate: integer("dueDate", { mode: "timestamp" }),
	// Optionally attach a course to this task.
	courseId: text("courseId").references(() => coursesTable.id, { onDelete: "cascade" }),
	link: text("link"),
	note: text("note"),
	priority: integer("priority"),
	// In minutes
	timeToComplete: integer("timeToComplete"),
});
