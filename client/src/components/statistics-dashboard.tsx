import { Task, PomodoroSession } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, TrendingUp, Target, Zap } from "lucide-react";

interface StatisticsDashboardProps {
  tasks: Task[];
  pomodoroSessions: PomodoroSession[];
}

export function StatisticsDashboard({ tasks, pomodoroSessions }: StatisticsDashboardProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const incompleteTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tasks by priority
  const highPriorityTasks = tasks.filter((t) => t.priority === "high" && !t.completed).length;
  const overdueTasks = tasks.filter((t) => {
    const today = new Date().toISOString().split("T")[0];
    return t.date < today && !t.completed;
  }).length;

  // Pomodoro stats
  const totalPomodoros = pomodoroSessions.length;
  const totalMinutes = pomodoroSessions.reduce((sum, session) => sum + session.duration, 0);

  // This week stats
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekTasks = tasks.filter((t) => {
    const taskDate = new Date(t.date);
    return taskDate >= weekAgo && taskDate <= today;
  });
  const thisWeekCompleted = thisWeekTasks.filter((t) => t.completed).length;

  const stats = [
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      description: `${completedTasks} of ${totalTasks} tasks`,
      color: "text-chart-1",
    },
    {
      title: "Total Tasks",
      value: totalTasks.toString(),
      icon: Target,
      description: `${incompleteTasks} remaining`,
      color: "text-chart-2",
    },
    {
      title: "High Priority",
      value: highPriorityTasks.toString(),
      icon: Circle,
      description: "Urgent tasks",
      color: "text-destructive",
    },
    {
      title: "Overdue",
      value: overdueTasks.toString(),
      icon: Clock,
      description: "Need attention",
      color: "text-chart-4",
    },
    {
      title: "This Week",
      value: thisWeekCompleted.toString(),
      icon: CheckCircle2,
      description: `${thisWeekTasks.length} total`,
      color: "text-chart-5",
    },
    {
      title: "Pomodoros",
      value: totalPomodoros.toString(),
      icon: Zap,
      description: `${totalMinutes} minutes`,
      color: "text-chart-3",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid={`stat-value-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
