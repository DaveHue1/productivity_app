import { Task, Track } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, GripVertical } from "lucide-react";
import { TASK_TYPES } from "@/lib/constants";
import { formatTime } from "@/lib/utils-date";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  track?: Track;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: () => void;
  showDate?: boolean;
}

export function TaskItem({
  task,
  track,
  onToggleComplete,
  onEdit,
  onDelete,
  draggable = false,
  onDragStart,
  onDragEnd,
  showDate = false,
}: TaskItemProps) {
  const taskType = TASK_TYPES[task.type as keyof typeof TASK_TYPES];
  
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg p-4 transition-all",
        "border border-card-border",
        `priority-${task.priority}`,
        task.completed && "opacity-60",
        !track && "bg-card"
      )}
      draggable={draggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, task) : undefined}
      onDragEnd={onDragEnd}
      style={track ? { backgroundColor: `${track.color}30`, borderColor: `${track.color}60` } : undefined}
      data-testid={`task-item-${task.id}`}
    >
      {draggable && (
        <div className="cursor-grab active:cursor-grabbing" data-testid="task-drag-handle">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => onToggleComplete(task.id, checked as boolean)}
        data-testid={`checkbox-task-${task.id}`}
        className="mt-0.5"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg" data-testid={`task-icon-${task.id}`}>
            {taskType.icon}
          </span>
          <span
            className={cn(
              "font-medium",
              task.completed && "line-through text-muted-foreground"
            )}
            data-testid={`task-title-${task.id}`}
          >
            {task.title}
          </span>
          
          {task.recurring !== "none" && (
            <Badge variant="secondary" className="text-xs" data-testid={`badge-recurring-${task.id}`}>
              🔄 {task.recurring}
            </Badge>
          )}
          
          {track && (
            <Badge
              style={{ backgroundColor: track.color, color: "white" }}
              className="text-xs"
              data-testid={`badge-track-${task.id}`}
            >
              {track.name}
            </Badge>
          )}
        </div>
        
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1" data-testid={`task-description-${task.id}`}>
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
          {showDate && (
            <span data-testid={`task-date-${task.id}`}>
              📅 {new Date(task.date).toLocaleDateString()}
            </span>
          )}
          {task.startTime && task.endTime && (
            <span data-testid={`task-time-${task.id}`}>
              🕐 {formatTime(task.startTime)} - {formatTime(task.endTime)}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          data-testid={`button-edit-task-${task.id}`}
          className="h-8 w-8"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          data-testid={`button-delete-task-${task.id}`}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
