import { useMemo, useState } from "react";
import { format, addDays, startOfDay, isSameDay, parseISO } from "date-fns";
import type { Task, Track } from "@shared/schema";
import { TASK_TYPES } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HorizontalTimelineProps {
  tasks: Task[];
  tracks: Track[];
  onTaskClick?: (task: Task) => void;
}

export function HorizontalTimeline({ tasks, tracks, onTaskClick }: HorizontalTimelineProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>("all");
  const [startDate, setStartDate] = useState(new Date());
  
  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => addDays(startDate, i));
  }, [startDate]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    if (selectedTrackId !== "all") {
      filtered = filtered.filter(task => task.trackId === selectedTrackId);
    }
    
    const endDate = addDays(startDate, 14);
    filtered = filtered.filter(task => {
      const taskDate = parseISO(task.date);
      return taskDate >= startOfDay(startDate) && taskDate < endDate;
    });
    
    return filtered.sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks, selectedTrackId, startDate]);

  const getTasksForDay = (day: Date) => {
    return filteredTasks.filter(task => isSameDay(parseISO(task.date), day));
  };

  const goToPreviousWeek = () => {
    setStartDate(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setStartDate(prev => addDays(prev, 7));
  };

  const goToToday = () => {
    setStartDate(new Date());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Upcoming Tasks Timeline (2 Weeks)</h3>
        <div className="flex items-center gap-2">
          <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tracks</SelectItem>
              {tracks.map((track) => (
                <SelectItem key={track.id} value={track.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: track.color }}
                    />
                    {track.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-4">
          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={day.toISOString()}
                className={`flex-shrink-0 w-40 rounded-lg border p-3 ${
                  isToday ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="text-center mb-3">
                  <div className="text-sm font-semibold">
                    {format(day, "EEE")}
                  </div>
                  <div className={`text-2xl font-bold ${isToday ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(day, "MMM yyyy")}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {dayTasks.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      No tasks
                    </div>
                  ) : (
                    dayTasks.map((task) => {
                      const taskType = TASK_TYPES[task.type as keyof typeof TASK_TYPES];
                      const track = tracks.find(t => t.id === task.trackId);
                      
                      return (
                        <div
                          key={task.id}
                          className="rounded p-2 cursor-pointer hover:opacity-80 transition-opacity text-white text-xs"
                          style={{ backgroundColor: taskType?.color || "#8b5cf6" }}
                          onClick={() => onTaskClick?.(task)}
                        >
                          <div className="font-semibold truncate">
                            {taskType?.icon} {task.title}
                          </div>
                          {task.startTime && (
                            <div className="text-xs opacity-90 mt-1">
                              {task.startTime}
                            </div>
                          )}
                          {track && (
                            <Badge 
                              className="mt-1 text-[10px] px-1 py-0"
                              style={{ 
                                backgroundColor: track.color,
                                borderColor: track.color 
                              }}
                            >
                              {track.name}
                            </Badge>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
