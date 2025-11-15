import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import { POMODORO_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PomodoroTimerProps {
  onClose: () => void;
  onComplete: (duration: number) => void;
}

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export function PomodoroTimer({ onClose, onComplete }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(POMODORO_PRESETS.pomodoro * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const totalTime = POMODORO_PRESETS[mode] * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (mode === "pomodoro") {
      setSessionCount((prev) => prev + 1);
      onComplete(POMODORO_PRESETS.pomodoro);
      playNotificationSound();
    }
  };

  const playNotificationSound = () => {
    // Browser notification sound (simple beep)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(POMODORO_PRESETS[newMode] * 60);
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(POMODORO_PRESETS[mode] * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
          data-testid="button-close-pomodoro"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Pomodoro Timer</h2>
          <p className="text-sm text-muted-foreground">
            Sessions completed: {sessionCount}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={mode === "pomodoro" ? "default" : "outline"}
            onClick={() => handleModeChange("pomodoro")}
            className="flex-1"
            data-testid="button-mode-pomodoro"
          >
            Pomodoro
          </Button>
          <Button
            variant={mode === "shortBreak" ? "default" : "outline"}
            onClick={() => handleModeChange("shortBreak")}
            className="flex-1"
            data-testid="button-mode-short-break"
          >
            Short Break
          </Button>
          <Button
            variant={mode === "longBreak" ? "default" : "outline"}
            onClick={() => handleModeChange("longBreak")}
            className="flex-1"
            data-testid="button-mode-long-break"
          >
            Long Break
          </Button>
        </div>

        <div className="relative">
          <div className="flex items-center justify-center h-48">
            <div
              className={cn(
                "relative w-40 h-40 rounded-full flex items-center justify-center",
                "border-8 border-primary/20",
                isRunning && "animate-pulse"
              )}
            >
              <div className="text-center">
                <div className="text-5xl font-bold" data-testid="text-timer">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {mode === "pomodoro" ? "Focus Time" : mode === "shortBreak" ? "Short Break" : "Long Break"}
                </div>
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            size="lg"
            onClick={() => setIsRunning(!isRunning)}
            data-testid="button-toggle-timer"
            className="w-32"
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleReset}
            data-testid="button-reset-timer"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
        </div>
      </Card>
    </div>
  );
}
