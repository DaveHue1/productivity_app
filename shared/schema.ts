import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Tracks table - for organizing tasks by course/category
export const tracks = pgTable("tracks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").notNull(), // hex color
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Projects table - for organizing tasks under tracks
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").default(""),
  trackId: varchar("track_id").notNull(),
  color: text("color"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").default(""),
  type: varchar("type", { length: 50 }).notNull().default("assignment"), // assignment, exam, event, reminder, meeting, project, deadline
  date: text("date").notNull(), // YYYY-MM-DD
  endDate: text("end_date"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  completed: boolean("completed").notNull().default(false),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // high, medium, low
  trackId: varchar("track_id"),
  projectId: varchar("project_id"),
  recurring: varchar("recurring", { length: 20 }).notNull().default("none"), // none, daily, weekly, monthly
  recurringDays: text("recurring_days"),
  recurringEndDate: text("recurring_end_date"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Subtasks table
export const subtasks = pgTable("subtasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Pomodoro sessions table
export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id"),
  duration: integer("duration").notNull(), // in minutes
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

// Insert schemas
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertSubtaskSchema = createInsertSchema(subtasks).omit({
  id: true,
  createdAt: true,
});

export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).omit({
  id: true,
  completedAt: true,
});

// Select types
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Subtask = typeof subtasks.$inferSelect;
export type InsertSubtask = z.infer<typeof insertSubtaskSchema>;

export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
export type InsertPomodoroSession = z.infer<typeof insertPomodoroSessionSchema>;

// Helper types
export type TaskType = "assignment" | "exam" | "event" | "reminder" | "meeting" | "project" | "deadline";
export type Priority = "high" | "medium" | "low";
export type RecurringType = "none" | "daily" | "weekly" | "monthly";
