import { useMemo, useRef } from "react";
import { format, parseISO } from "date-fns";
import type { Task } from "@shared/schema";
import { TASK_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";

interface TimeBlockCalendarProps {
  date: Date;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function TimeBlockCalendar({ date, tasks, onTaskClick }: TimeBlockCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const tasksForDate = useMemo(() => {
    const dateStr = format(date, "yyyy-MM-dd");
    return tasks.filter(task => {
      if (task.date === dateStr && task.startTime && task.endTime) {
        return true;
      }
      return false;
    });
  }, [date, tasks]);

  const getTaskPosition = (task: Task) => {
    if (!task.startTime || !task.endTime) return null;
    
    const [startHour, startMin] = task.startTime.split(":").map(Number);
    const [endHour, endMin] = task.endTime.split(":").map(Number);
    
    const top = (startHour + startMin / 60) * 60;
    const duration = (endHour + endMin / 60) - (startHour + startMin / 60);
    const height = duration * 60;
    
    return { top, height };
  };

  const exportAsPNG = async () => {
    if (!calendarRef.current) return;
    
    try {
      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      
      const link = document.createElement("a");
      link.download = `schedule-${format(date, "yyyy-MM-dd")}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Failed to export calendar:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Time Blocks - {format(date, "MMMM d, yyyy")}</h3>
        <Button onClick={exportAsPNG} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export as PNG
        </Button>
      </div>
      
      <div 
        ref={calendarRef}
        className="bg-white rounded-lg border border-border p-4 relative"
        style={{ minHeight: "1440px" }}
      >
        {hours.map((hour) => (
          <div 
            key={hour}
            className="relative h-[60px] border-b border-gray-200"
            style={{ top: `${hour * 60}px` }}
          >
            <div className="absolute left-0 top-0 w-16 text-sm text-muted-foreground font-medium">
              {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
            </div>
          </div>
        ))}
        
        <div className="absolute top-0 left-20 right-0" style={{ height: "1440px" }}>
          {tasksForDate.map((task) => {
            const position = getTaskPosition(task);
            if (!position) return null;
            
            const taskType = TASK_TYPES[task.type as keyof typeof TASK_TYPES];
            
            return (
              <div
                key={task.id}
                className="absolute left-0 right-0 mx-2 rounded-lg p-2 cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  top: `${position.top}px`,
                  height: `${position.height}px`,
                  backgroundColor: taskType?.color || "#8b5cf6",
                  color: "white",
                  zIndex: 10,
                }}
                onClick={() => onTaskClick?.(task)}
              >
                <div className="text-sm font-semibold truncate">
                  {taskType?.icon} {task.title}
                </div>
                {position.height > 40 && (
                  <div className="text-xs opacity-90 mt-1 truncate">
                    {task.startTime} - {task.endTime}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
