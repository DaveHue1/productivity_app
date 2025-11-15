import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").default(""),
  type: varchar("type", { length: 50 }).notNull().default("assignment"), // assignment, exam, event, reminder, meeting, project
  date: text("date").notNull(), // YYYY-MM-DD
  endDate: text("end_date").default(null), // For multi-day tasks
  startTime: text("start_time").default(null), // HH:MM for time blocking
  endTime: text("end_time").default(null), // HH:MM for time blocking
  completed: boolean("completed").notNull().default(false),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // high, medium, low
  trackId: varchar("track_id").default(null),
  recurring: varchar("recurring", { length: 20 }).notNull().default("none"), // none, daily, weekly, monthly
  recurringDays: text("recurring_days").default(null), // JSON array for weekly: ["mon", "wed", "fri"]
  recurringEndDate: text("recurring_end_date").default(null), // When recurring should stop
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tracks table - for organizing tasks by course/category
export const tracks = pgTable("tracks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").notNull(), // hex color
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Pomodoro sessions table
export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").default(null),
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

export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).omit({
  id: true,
  completedAt: true,
});

// Select types
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;

export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
export type InsertPomodoroSession = z.infer<typeof insertPomodoroSessionSchema>;

// Helper types
export type TaskType = "assignment" | "exam" | "event" | "reminder" | "meeting" | "project";
export type Priority = "high" | "medium" | "low";
export type RecurringType = "none" | "daily" | "weekly" | "monthly";
