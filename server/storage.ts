import {
  type Task,
  type InsertTask,
  type Track,
  type InsertTrack,
  type PomodoroSession,
  type InsertPomodoroSession,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Tracks
  getTracks(): Promise<Track[]>;
  getTrack(id: string): Promise<Track | undefined>;
  createTrack(track: InsertTrack): Promise<Track>;
  updateTrack(id: string, track: Partial<InsertTrack>): Promise<Track | undefined>;
  deleteTrack(id: string): Promise<boolean>;

  // Pomodoro Sessions
  getPomodoroSessions(): Promise<PomodoroSession[]>;
  createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession>;
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task>;
  private tracks: Map<string, Track>;
  private pomodoroSessions: Map<string, PomodoroSession>;

  constructor() {
    this.tasks = new Map();
    this.tracks = new Map();
    this.pomodoroSessions = new Map();

    // Add some sample data for development
    this.seedData();
  }

  private seedData() {
    // Create sample tracks
    const track1: Track = {
      id: randomUUID(),
      name: "Computer Science",
      color: "#8b5cf6",
      createdAt: new Date(),
    };
    const track2: Track = {
      id: randomUUID(),
      name: "Mathematics",
      color: "#3b82f6",
      createdAt: new Date(),
    };
    this.tracks.set(track1.id, track1);
    this.tracks.set(track2.id, track2);

    // Create sample tasks
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const task1: Task = {
      id: randomUUID(),
      title: "Complete Algorithm Assignment",
      description: "Implement binary search tree operations",
      type: "assignment",
      date: today,
      endDate: null,
      startTime: "14:00",
      endTime: "16:00",
      completed: false,
      priority: "high",
      trackId: track1.id,
      recurring: "none",
      recurringDays: null,
      recurringEndDate: null,
      createdAt: new Date(),
    };

    const task2: Task = {
      id: randomUUID(),
      title: "Study for Calculus Midterm",
      description: "Review chapters 5-7",
      type: "exam",
      date: tomorrow,
      endDate: null,
      startTime: null,
      endTime: null,
      completed: false,
      priority: "high",
      trackId: track2.id,
      recurring: "none",
      recurringDays: null,
      recurringEndDate: null,
      createdAt: new Date(),
    };

    const task3: Task = {
      id: randomUUID(),
      title: "Team Meeting",
      description: "Discuss project milestones",
      type: "meeting",
      date: today,
      endDate: null,
      startTime: "10:00",
      endTime: "11:00",
      completed: true,
      priority: "medium",
      trackId: null,
      recurring: "none",
      recurringDays: null,
      recurringEndDate: null,
      createdAt: new Date(),
    };

    this.tasks.set(task1.id, task1);
    this.tasks.set(task2.id, task2);
    this.tasks.set(task3.id, task3);
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(
    id: string,
    updates: Partial<InsertTask>
  ): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask: Task = {
      ...task,
      ...updates,
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Track methods
  async getTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  async getTrack(id: string): Promise<Track | undefined> {
    return this.tracks.get(id);
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const id = randomUUID();
    const track: Track = {
      ...insertTrack,
      id,
      createdAt: new Date(),
    };
    this.tracks.set(id, track);
    return track;
  }

  async updateTrack(
    id: string,
    updates: Partial<InsertTrack>
  ): Promise<Track | undefined> {
    const track = this.tracks.get(id);
    if (!track) return undefined;

    const updatedTrack: Track = {
      ...track,
      ...updates,
    };
    this.tracks.set(id, updatedTrack);
    return updatedTrack;
  }

  async deleteTrack(id: string): Promise<boolean> {
    return this.tracks.delete(id);
  }

  // Pomodoro Session methods
  async getPomodoroSessions(): Promise<PomodoroSession[]> {
    return Array.from(this.pomodoroSessions.values()).sort(
      (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
    );
  }

  async createPomodoroSession(
    insertSession: InsertPomodoroSession
  ): Promise<PomodoroSession> {
    const id = randomUUID();
    const session: PomodoroSession = {
      ...insertSession,
      id,
      completedAt: new Date(),
    };
    this.pomodoroSessions.set(id, session);
    return session;
  }
}

export const storage = new MemStorage();
