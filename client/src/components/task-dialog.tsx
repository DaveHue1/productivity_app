import { useState, useEffect } from "react";
import { Task, InsertTask, Track, Subtask, InsertSubtask, Project } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TASK_TYPES } from "@/lib/constants";
import { getTodayString } from "@/lib/utils-date";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  tracks: Track[];
  onSave: (task: InsertTask | (Task & Partial<InsertTask>)) => void;
}

function SortableSubtaskItem({
  subtask,
  onToggle,
  onDelete,
}: {
  subtask: Subtask;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: subtask.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
      data-testid={`subtask-item-${subtask.id}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <Checkbox
        checked={subtask.completed}
        onCheckedChange={onToggle}
        data-testid={`checkbox-subtask-${subtask.id}`}
      />
      <span
        className={`flex-1 text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}
        data-testid={`text-subtask-title-${subtask.id}`}
      >
        {subtask.title}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-7 w-7"
        data-testid={`button-delete-subtask-${subtask.id}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function TaskDialog({ open, onOpenChange, task, tracks, onSave }: TaskDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<InsertTask>({
    title: "",
    description: "",
    type: "assignment",
    date: getTodayString(),
    endDate: null,
    startTime: null,
    endTime: null,
    completed: false,
    priority: "medium",
    trackId: null,
    projectId: null,
    recurring: "none",
    recurringDays: null,
    recurringEndDate: null,
  });

  const [isMultiDay, setIsMultiDay] = useState(false);
  const [hasTime, setHasTime] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  // Fetch subtasks when editing a task
  const { data: fetchedSubtasks } = useQuery<Subtask[]>({
    queryKey: ["/api/tasks", task?.id, "subtasks"],
    enabled: !!task?.id && open,
  });

  // Fetch projects for project selector
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: open,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mutations
  const createSubtaskMutation = useMutation({
    mutationFn: async (data: InsertSubtask) => {
      const res = await apiRequest("POST", "/api/subtasks", data);
      return res.json();
    },
    onSuccess: (newSubtask: Subtask) => {
      setSubtasks([...subtasks, newSubtask]);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", task?.id, "subtasks"] });
      toast({ title: "Subtask added" });
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertSubtask> }) => {
      const res = await apiRequest("PATCH", `/api/subtasks/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", task?.id, "subtasks"] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/subtasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", task?.id, "subtasks"] });
      toast({ title: "Subtask deleted" });
    },
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
      setIsMultiDay(!!task.endDate);
      setHasTime(!!task.startTime && !!task.endTime);
      setIsRecurring(task.recurring !== "none");
    } else {
      setFormData({
        title: "",
        description: "",
        type: "assignment",
        date: getTodayString(),
        endDate: null,
        startTime: null,
        endTime: null,
        completed: false,
        priority: "medium",
        trackId: null,
        projectId: null,
        recurring: "none",
        recurringDays: null,
        recurringEndDate: null,
      });
      setIsMultiDay(false);
      setHasTime(false);
      setIsRecurring(false);
      setSubtasks([]);
    }
  }, [task, open]);

  useEffect(() => {
    if (fetchedSubtasks) {
      setSubtasks(fetchedSubtasks);
    }
  }, [fetchedSubtasks]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim() || !task?.id) return;

    createSubtaskMutation.mutate({
      taskId: task.id,
      title: newSubtaskTitle,
      completed: false,
      order: subtasks.length,
    });
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (subtask: Subtask) => {
    updateSubtaskMutation.mutate({
      id: subtask.id,
      updates: { completed: !subtask.completed },
    });
    setSubtasks(subtasks.map(st => 
      st.id === subtask.id ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleDeleteSubtask = (id: string) => {
    deleteSubtaskMutation.mutate(id);
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSubtasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Update order in backend
        newOrder.forEach((item, index) => {
          if (item.order !== index) {
            updateSubtaskMutation.mutate({
              id: item.id,
              updates: { order: index },
            });
          }
        });
        
        return newOrder;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task) {
      onSave({ ...task, ...formData });
    } else {
      onSave(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-task">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              data-testid="input-task-title"
              placeholder="Enter task title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger id="type" data-testid="select-task-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key} data-testid={`option-type-${key}`}>
                      {value.icon} {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
              >
                <SelectTrigger id="priority" data-testid="select-task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high" data-testid="option-priority-high">🔴 High</SelectItem>
                  <SelectItem value="medium" data-testid="option-priority-medium">🟡 Medium</SelectItem>
                  <SelectItem value="low" data-testid="option-priority-low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="track">Track (Optional)</Label>
              <Select
                value={formData.trackId || "none"}
                onValueChange={(value) => setFormData({ ...formData, trackId: value === "none" ? null : value })}
              >
                <SelectTrigger id="track" data-testid="select-task-track">
                  <SelectValue placeholder="Select a track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" data-testid="option-track-none">No Track</SelectItem>
                  {tracks.map((track) => (
                    <SelectItem key={track.id} value={track.id} data-testid={`option-track-${track.id}`}>
                      <span style={{ color: track.color }}>●</span> {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select
                value={formData.projectId || "none"}
                onValueChange={(value) => setFormData({ ...formData, projectId: value === "none" ? null : value })}
              >
                <SelectTrigger id="project" data-testid="select-task-project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" data-testid="option-project-none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id} data-testid={`option-project-${project.id}`}>
                      {project.color && <span style={{ color: project.color }}>●</span>} {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="textarea-task-description"
              placeholder="Add details about this task"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="multiday"
                checked={isMultiDay}
                onCheckedChange={(checked) => {
                  setIsMultiDay(checked as boolean);
                  if (!checked) setFormData({ ...formData, endDate: null });
                }}
                data-testid="checkbox-multiday"
              />
              <Label htmlFor="multiday" className="cursor-pointer">Multi-day task</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  data-testid="input-task-date"
                />
              </div>

              {isMultiDay && (
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    data-testid="input-task-end-date"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hastime"
                checked={hasTime}
                onCheckedChange={(checked) => {
                  setHasTime(checked as boolean);
                  if (!checked) setFormData({ ...formData, startTime: null, endTime: null });
                }}
                data-testid="checkbox-has-time"
              />
              <Label htmlFor="hastime" className="cursor-pointer">Add specific time</Label>
            </div>

            {hasTime && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime || ""}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    data-testid="input-task-start-time"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime || ""}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    data-testid="input-task-end-time"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => {
                  setIsRecurring(checked as boolean);
                  if (!checked) setFormData({ ...formData, recurring: "none", recurringDays: null, recurringEndDate: null });
                }}
                data-testid="checkbox-recurring"
              />
              <Label htmlFor="recurring" className="cursor-pointer">Recurring task</Label>
            </div>

            {isRecurring && (
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="recurringType">Frequency</Label>
                  <Select
                    value={formData.recurring}
                    onValueChange={(value) => setFormData({ ...formData, recurring: value as any })}
                  >
                    <SelectTrigger id="recurringType" data-testid="select-recurring-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily" data-testid="option-recurring-daily">Daily</SelectItem>
                      <SelectItem value="weekly" data-testid="option-recurring-weekly">Weekly</SelectItem>
                      <SelectItem value="monthly" data-testid="option-recurring-monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurringEndDate">Recurring Until (Optional)</Label>
                  <Input
                    id="recurringEndDate"
                    type="date"
                    value={formData.recurringEndDate || ""}
                    onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                    data-testid="input-recurring-end-date"
                  />
                </div>
              </div>
            )}
          </div>

          {task && (
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-base">Subtasks</Label>
              
              {subtasks.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={subtasks.map(st => st.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {subtasks.map((subtask) => (
                        <SortableSubtaskItem
                          key={subtask.id}
                          subtask={subtask}
                          onToggle={() => handleToggleSubtask(subtask)}
                          onDelete={() => handleDeleteSubtask(subtask.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  data-testid="input-new-subtask"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim()}
                  data-testid="button-add-subtask"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save-task">
              {task ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
