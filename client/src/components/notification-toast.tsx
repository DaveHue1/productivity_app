import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "info" | "warning" | "error" | "success";
}

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const typeStyles = {
    info: "bg-primary/10 border-primary",
    warning: "bg-accent/10 border-accent",
    error: "bg-destructive/10 border-destructive",
    success: "bg-chart-5/10 border-chart-5",
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 max-w-sm p-4 rounded-lg border-2 shadow-lg z-50",
        "slide-in-right bg-card",
        typeStyles[notification.type]
      )}
      data-testid={`notification-${notification.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-sm" data-testid="notification-title">
            {notification.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1" data-testid="notification-description">
            {notification.description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onDismiss(notification.id)}
          data-testid="button-dismiss-notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
