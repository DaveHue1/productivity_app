import { useState } from "react";
import { Task, Track } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  getTodayString,
  isToday as checkIsToday,
} from "@/lib/utils-date";
import { TASK_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  tasks: Task[];
  tracks: Track[];
  onDateClick: (date: string) => void;
  onTaskClick: (task: Task) => void;
}

export function CalendarView({ tasks, tracks, onDateClick, onTaskClick }: CalendarViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const getTasksForDate = (day: number): Task[] => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter((task) => {
      const taskDate = task.date;
      const taskEndDate = task.endDate || task.date;
      return dateStr >= taskDate && dateStr <= taskEndDate;
    });
  };

  const getTrackForTask = (task: Task): Track | undefined => {
    return tracks.find((t) => t.id === task.trackId);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[120px] bg-muted/30" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isToday = checkIsToday(dateStr);
      const dayTasks = getTasksForDate(day);

      days.push(
        <div
          key={day}
          className={cn(
            "min-h-[120px] border border-border p-2 cursor-pointer transition-colors hover-elevate",
            "bg-card",
            isToday && "border-primary border-2"
          )}
          onClick={() => onDateClick(dateStr)}
          data-testid={`calendar-day-${day}`}
        >
          <div className={cn(
            "text-sm font-medium mb-2",
            isToday && "text-primary"
          )}>
            {day}
          </div>
          <div className="space-y-1">
            {dayTasks.slice(0, 3).map((task) => {
              const track = getTrackForTask(task);
              const taskType = TASK_TYPES[task.type];
              
              return (
                <div
                  key={task.id}
                  className={cn(
                    "text-xs p-1 rounded truncate",
                    "hover-elevate cursor-pointer",
                    task.completed && "opacity-50 line-through"
                  )}
                  style={track ? { backgroundColor: `${track.color}20`, color: track.color } : { backgroundColor: "hsl(var(--secondary))" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                  data-testid={`calendar-task-${task.id}`}
                >
                  <span className="mr-1">{taskType.icon}</span>
                  {task.title}
                </div>
              );
            })}
            {dayTasks.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{dayTasks.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          {getMonthName(currentMonth)} {currentYear}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            data-testid="button-today"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
            data-testid="button-previous-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </Card>
  );
}
