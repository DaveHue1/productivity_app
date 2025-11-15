import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, Track } from "@shared/schema";
import { TASK_TYPES } from "@/lib/constants";
import { GripVertical, Clock, CheckCircle2, Circle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface DragDropTaskListProps {
  tasks: Task[];
  tracks: Track[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskClick?: (task: Task) => void;
}

function SortableTaskItem({ 
  task, 
  track,
  onToggle,
  onClick 
}: { 
  task: Task;
  track?: Track;
  onToggle: () => void;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskType = TASK_TYPES[task.type as keyof typeof TASK_TYPES];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <Checkbox
        checked={task.completed}
        onCheckedChange={onToggle}
      />
      
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{taskType?.icon}</span>
          <span className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </span>
          {track && (
            <span 
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: track.color }}
            >
              {track.name}
            </span>
          )}
        </div>
        {task.startTime && task.endTime && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Clock className="w-3 h-3" />
            {task.startTime} - {task.endTime}
          </div>
        )}
      </div>
      
      {task.priority === "high" && (
        <div className="text-xs font-semibold text-destructive">HIGH</div>
      )}
    </div>
  );
}

export function DragDropTaskList({ tasks, tracks, onTaskUpdate, onTaskClick }: DragDropTaskListProps) {
  const [sortedTasks, setSortedTasks] = useState(tasks);
  
  useEffect(() => {
    setSortedTasks(tasks);
  }, [tasks]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortedTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Update order in backend for all affected tasks
        newOrder.forEach((task, index) => {
          if ((task.order || 0) !== index) {
            onTaskUpdate(task.id, { order: index });
          }
        });
        
        return newOrder;
      });
    }
  };

  const handleToggle = (task: Task) => {
    onTaskUpdate(task.id, { completed: !task.completed });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Rearrange Tasks</h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedTasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sortedTasks.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No tasks for this day
              </div>
            ) : (
              sortedTasks.map((task) => {
                const track = tracks.find(t => t.id === task.trackId);
                return (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    track={track}
                    onToggle={() => handleToggle(task)}
                    onClick={() => onTaskClick?.(task)}
                  />
                );
              })
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
