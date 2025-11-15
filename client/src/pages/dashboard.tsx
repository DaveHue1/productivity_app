import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, Track, Project, InsertTask } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { TrackDialog } from "@/components/track-dialog";
import { ProjectDialog } from "@/components/project-dialog";
import { CalendarView } from "@/components/calendar-view";
import { StatisticsDashboard } from "@/components/statistics-dashboard";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { ExportDialog } from "@/components/export-dialog";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { NotificationToast, Notification } from "@/components/notification-toast";
import { HorizontalTimeline } from "@/components/horizontal-timeline";
import {
  Plus,
  Search,
  Calendar,
  BarChart3,
  Timer,
  Download,
  Layers,
  Clock,
  AlertCircle,
  CalendarRange,
} from "lucide-react";
import { getTodayString, isToday, addDays, isPast } from "@/lib/utils-date";
import { TASK_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type View = "dashboard" | "calendar" | "statistics" | "tracks" | "timeline";

export default function Dashboard() {
  const { toast } = useToast();
  const [view, setView] = useState<View>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [editingTrack, setEditingTrack] = useState<Track | undefined>();
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTrackForProject, setSelectedTrackForProject] = useState<string | null>(null);

  // Fetch data
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: pomodoroSessions = [], isLoading: pomodoroLoading } = useQuery<any[]>({
    queryKey: ["/api/pomodoro-sessions"],
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (task: InsertTask) => apiRequest("POST", "/api/tasks", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task created successfully" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...task }: Task & Partial<InsertTask>) =>
      apiRequest("PATCH", `/api/tasks/${id}`, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task updated successfully" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task deleted successfully" });
    },
  });

  const createTrackMutation = useMutation({
    mutationFn: (track: any) => apiRequest("POST", "/api/tracks", track),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      toast({ title: "Track created successfully" });
    },
  });

  const updateTrackMutation = useMutation({
    mutationFn: ({ id, ...track }: any) => apiRequest("PATCH", `/api/tracks/${id}`, track),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      toast({ title: "Track updated successfully" });
    },
  });

  const deleteTrackMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tracks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      toast({ title: "Track deleted successfully" });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (project: any) => apiRequest("POST", "/api/projects", project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project created successfully" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, ...project }: any) => apiRequest("PATCH", `/api/projects/${id}`, project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project updated successfully" });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project deleted successfully" });
    },
  });

  const completePomodoroMutation = useMutation({
    mutationFn: (duration: number) =>
      apiRequest("POST", "/api/pomodoro-sessions", { duration, taskId: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pomodoro-sessions"] });
      toast({ title: "Pomodoro session completed!" });
    },
  });

  // Check for overdue tasks and show notifications
  useEffect(() => {
    if (tasksLoading || tasks.length === 0) return;
    
    const overdueTasks = tasks.filter((task) => isPast(task.date) && !task.completed);
    
    if (overdueTasks.length > 0 && notifications.findIndex(n => n.id.startsWith("overdue")) === -1) {
      const notification: Notification = {
        id: `overdue-${Date.now()}`,
        title: "Overdue Tasks",
        description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}`,
        type: "warning",
      };
      setNotifications((prev) => [...prev, notification]);
    }

    // Check for upcoming high-priority tasks
    const tomorrow = addDays(getTodayString(), 1);
    const upcomingHighPriority = tasks.filter(
      (task) => task.date === tomorrow && task.priority === "high" && !task.completed
    );

    if (upcomingHighPriority.length > 0 && notifications.findIndex(n => n.id.startsWith("upcoming")) === -1) {
      const notification: Notification = {
        id: `upcoming-${Date.now()}`,
        title: "High Priority Tomorrow",
        description: `${upcomingHighPriority.length} high-priority task${upcomingHighPriority.length > 1 ? "s" : ""} due tomorrow`,
        type: "info",
      };
      setNotifications((prev) => [...prev, notification]);
    }
  }, [tasks, tasksLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "n":
          setTaskDialogOpen(true);
          break;
        case "t":
          setView("tracks");
          break;
        case "c":
          setView("calendar");
          break;
        case "s":
          setView("statistics");
          break;
        case "p":
          setPomodoroOpen(true);
          break;
        case "e":
          setExportDialogOpen(true);
          break;
        case "/":
          e.preventDefault();
          document.getElementById("search-input")?.focus();
          break;
        case "?":
          setShortcutsOpen(true);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Filter and sort tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const todaysTasks = filteredTasks
    .filter((task) => isToday(task.date) || (task.endDate && isToday(task.endDate)))
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const upcomingTasks = filteredTasks
    .filter((task) => task.date > getTodayString() && !task.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  const handleTaskSave = (task: InsertTask | (Task & Partial<InsertTask>)) => {
    if ("id" in task) {
      updateTaskMutation.mutate(task);
    } else {
      createTaskMutation.mutate(task);
    }
    setEditingTask(undefined);
  };

  const handleTrackSave = (track: any) => {
    if ("id" in track) {
      updateTrackMutation.mutate(track);
    } else {
      createTrackMutation.mutate(track);
    }
    setEditingTrack(undefined);
  };

  const handleProjectSave = (project: any) => {
    if ("id" in project) {
      updateProjectMutation.mutate(project);
    } else {
      createProjectMutation.mutate(project);
    }
    setEditingProject(undefined);
    setSelectedTrackForProject(null);
  };

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      updateTaskMutation.mutate({ ...task, completed });
    }
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      updateTaskMutation.mutate({ ...task, ...updates });
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDataImport = async (data: any) => {
    try {
      for (const track of data.tracks || []) {
        await apiRequest("POST", "/api/tracks", { name: track.name, color: track.color });
      }
      
      for (const project of data.projects || []) {
        await apiRequest("POST", "/api/projects", { name: project.name, description: project.description, trackId: project.trackId, color: project.color });
      }
      
      for (const task of data.tasks || []) {
        const { id, createdAt, ...taskData } = task;
        await apiRequest("POST", "/api/tasks", taskData);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      toast({
        title: "Data imported successfully",
        description: "All your data has been imported",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Some data could not be imported",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8 fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-semibold mb-2" data-testid="text-greeting">
                College Organizer
              </h1>
              <p className="text-lg text-foreground/80">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPomodoroOpen(true)}
                data-testid="button-open-pomodoro"
                title="Pomodoro Timer (P)"
              >
                <Timer className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setExportDialogOpen(true)}
                data-testid="button-open-export"
                title="Export Data (E)"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShortcutsOpen(true)}
                data-testid="button-open-shortcuts"
                title="Keyboard Shortcuts (?)"
              >
                <span className="text-lg font-semibold">?</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={view === "dashboard" ? "default" : "outline"}
              onClick={() => setView("dashboard")}
              data-testid="button-view-dashboard"
            >
              <Clock className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              onClick={() => setView("calendar")}
              data-testid="button-view-calendar"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={view === "tracks" ? "default" : "outline"}
              onClick={() => setView("tracks")}
              data-testid="button-view-tracks"
            >
              <Layers className="h-4 w-4 mr-2" />
              Tracks
            </Button>
            <Button
              variant={view === "statistics" ? "default" : "outline"}
              onClick={() => setView("statistics")}
              data-testid="button-view-statistics"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </Button>
            <Button
              variant={view === "timeline" ? "default" : "outline"}
              onClick={() => setView("timeline")}
              data-testid="button-view-timeline"
            >
              <CalendarRange className="h-4 w-4 mr-2" />
              Timeline
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="search-input"
              placeholder="Search tasks... (press / to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </header>

        {/* Main Content */}
        <main>
          {view === "dashboard" && (
            <div className="space-y-8">
              {/* Today's Tasks */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Today's Tasks</h2>
                  <Button onClick={() => setTaskDialogOpen(true)} data-testid="button-create-task">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                </div>

                {tasksLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-card border">
                        <Skeleton className="h-5 w-5" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : tasksError ? (
                  <div className="text-center py-12 text-destructive">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>Failed to load tasks. Please try again.</p>
                  </div>
                ) : todaysTasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks for today. Create one to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaysTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        track={tracks.find((t) => t.id === task.trackId)}
                        onToggleComplete={handleToggleComplete}
                        onEdit={(task) => {
                          setEditingTask(task);
                          setTaskDialogOpen(true);
                        }}
                        onDelete={(id) => deleteTaskMutation.mutate(id)}
                      />
                    ))}
                  </div>
                )}
              </Card>

              {/* Timeline */}
              <Card className="p-6">
                <HorizontalTimeline
                  tasks={filteredTasks}
                  tracks={tracks}
                  onTaskClick={(task) => {
                    setEditingTask(task);
                    setTaskDialogOpen(true);
                  }}
                />
              </Card>
            </div>
          )}

          {view === "calendar" && (
            <CalendarView
              tasks={filteredTasks}
              tracks={tracks}
              onDateClick={(date) => {
                setSelectedDate(date);
              }}
              onTaskClick={(task) => {
                setEditingTask(task);
                setTaskDialogOpen(true);
              }}
              onTaskUpdate={handleTaskUpdate}
            />
          )}

          {view === "timeline" && (
            <Card className="p-6">
              <HorizontalTimeline
                tasks={filteredTasks}
                tracks={tracks}
                onTaskClick={(task) => {
                  setEditingTask(task);
                  setTaskDialogOpen(true);
                }}
              />
            </Card>
          )}

          {view === "tracks" && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Tracks & Projects</h2>
                <Button onClick={() => setTrackDialogOpen(true)} data-testid="button-create-track">
                  <Plus className="h-4 w-4 mr-2" />
                  New Track
                </Button>
              </div>

              {tracksLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-8 w-48 mb-3" />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : tracks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tracks yet. Create one to organize your tasks!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {tracks.map((track) => {
                    const trackTasks = tasks.filter((t) => t.trackId === track.id);
                    const completedCount = trackTasks.filter((t) => t.completed).length;
                    const trackProjects = projects.filter((p) => p.trackId === track.id);

                    return (
                      <div key={track.id} data-testid={`track-section-${track.id}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold" style={{ color: track.color }}>
                              {track.name}
                            </h3>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingTrack(track);
                                  setTrackDialogOpen(true);
                                }}
                                data-testid={`button-edit-track-${track.id}`}
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => deleteTrackMutation.mutate(track.id)}
                                data-testid={`button-delete-track-${track.id}`}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTrackForProject(track.id);
                              setProjectDialogOpen(true);
                            }}
                            data-testid={`button-create-project-${track.id}`}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            New Project
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {trackTasks.length} task{trackTasks.length !== 1 ? "s" : ""} •{" "}
                          {completedCount} completed • {trackProjects.length} project{trackProjects.length !== 1 ? "s" : ""}
                        </p>

                        {trackProjects.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {trackProjects.map((project) => {
                              const projectTasks = tasks.filter((t) => t.projectId === project.id);
                              const projectCompletedCount = projectTasks.filter((t) => t.completed).length;

                              return (
                                <Card
                                  key={project.id}
                                  className="p-3"
                                  style={{ 
                                    borderLeftColor: project.color || track.color, 
                                    borderLeftWidth: "3px" 
                                  }}
                                  data-testid={`project-card-${project.id}`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h4 
                                        className="font-medium text-sm truncate" 
                                        style={{ color: project.color || track.color }}
                                      >
                                        {project.name}
                                      </h4>
                                      {project.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                          {project.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => {
                                          setEditingProject(project);
                                          setProjectDialogOpen(true);
                                        }}
                                        data-testid={`button-edit-project-${project.id}`}
                                      >
                                        ✏️
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive"
                                        onClick={() => deleteProjectMutation.mutate(project.id)}
                                        data-testid={`button-delete-project-${project.id}`}
                                      >
                                        🗑️
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {projectTasks.length} task{projectTasks.length !== 1 ? "s" : ""} •{" "}
                                    {projectCompletedCount} completed
                                  </p>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-sm text-muted-foreground border rounded-md border-dashed">
                            No projects yet. Click "New Project" to add one.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {view === "statistics" && (
            <StatisticsDashboard tasks={tasks} pomodoroSessions={pomodoroSessions} />
          )}
        </main>

        {/* Dialogs */}
        <TaskDialog
          open={taskDialogOpen}
          onOpenChange={(open) => {
            setTaskDialogOpen(open);
            if (!open) setEditingTask(undefined);
          }}
          task={editingTask}
          tracks={tracks}
          onSave={handleTaskSave}
        />

        <TrackDialog
          open={trackDialogOpen}
          onOpenChange={(open) => {
            setTrackDialogOpen(open);
            if (!open) setEditingTrack(undefined);
          }}
          track={editingTrack}
          onSave={handleTrackSave}
        />

        <ProjectDialog
          open={projectDialogOpen}
          onOpenChange={(open) => {
            setProjectDialogOpen(open);
            if (!open) {
              setEditingProject(undefined);
              setSelectedTrackForProject(null);
            }
          }}
          project={editingProject}
          tracks={tracks}
          onSave={(project) => {
            if (selectedTrackForProject && !editingProject) {
              handleProjectSave({ ...project, trackId: selectedTrackForProject });
            } else {
              handleProjectSave(project);
            }
          }}
        />

        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          tasks={tasks}
          tracks={tracks}
          projects={projects}
          onImport={handleDataImport}
        />

        <KeyboardShortcuts open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

        {pomodoroOpen && (
          <PomodoroTimer
            onClose={() => setPomodoroOpen(false)}
            onComplete={(duration) => completePomodoroMutation.mutate(duration)}
          />
        )}

        {/* Notifications */}
        {notifications.map((notification, index) => (
          <div key={notification.id} style={{ top: `${index * 100 + 16}px` }}>
            <NotificationToast
              notification={notification}
              onDismiss={dismissNotification}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
