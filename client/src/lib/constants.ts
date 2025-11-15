import type { TaskType } from "@shared/schema";

// Task type icons and colors
export const TASK_TYPES: Record<TaskType, { icon: string; label: string; color: string }> = {
  assignment: { icon: "📝", label: "Assignment", color: "#8b5cf6" },
  exam: { icon: "📚", label: "Exam", color: "#ef4444" },
  event: { icon: "📅", label: "Event", color: "#3b82f6" },
  reminder: { icon: "⏰", label: "Reminder", color: "#f59e0b" },
  meeting: { icon: "👥", label: "Meeting", color: "#10b981" },
  project: { icon: "🚀", label: "Project", color: "#ec4899" },
};

// Priority colors
export const PRIORITY_COLORS = {
  high: "hsl(var(--destructive))",
  medium: "hsl(var(--accent))",
  low: "hsl(var(--muted-foreground) / 0.4)",
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = [
  { keys: ["N"], description: "Create new task" },
  { keys: ["T"], description: "Open tracks" },
  { keys: ["C"], description: "Open calendar" },
  { keys: ["S"], description: "Open statistics" },
  { keys: ["P"], description: "Start Pomodoro timer" },
  { keys: ["E"], description: "Export data" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["Escape"], description: "Close dialog/modal" },
];

// Pomodoro timer presets (in minutes)
export const POMODORO_PRESETS = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
};
