import { useState } from "react";
import { Task, Track } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileJson, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils-date";
import { TASK_TYPES } from "@/lib/constants";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  tracks: Track[];
}

type ExportFormat = "json" | "csv" | "txt";

export function ExportDialog({ open, onOpenChange, tasks, tracks }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("json");

  const getTrackName = (trackId: string | null): string => {
    if (!trackId) return "None";
    const track = tracks.find((t) => t.id === trackId);
    return track ? track.name : "Unknown";
  };

  const exportAsJSON = () => {
    const data = {
      tasks,
      tracks,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    downloadFile(blob, "college-organizer-data.json");
  };

  const exportAsCSV = () => {
    const headers = ["Title", "Type", "Date", "Priority", "Track", "Completed", "Description"];
    const rows = tasks.map((task) => [
      task.title,
      TASK_TYPES[task.type].label,
      formatDate(task.date),
      task.priority,
      getTrackName(task.trackId),
      task.completed ? "Yes" : "No",
      task.description || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    downloadFile(blob, "college-organizer-tasks.csv");
  };

  const exportAsTXT = () => {
    const lines = ["COLLEGE ORGANIZER - TASKS EXPORT", ""];
    lines.push(`Exported: ${new Date().toLocaleString()}`, "");
    lines.push("=" .repeat(60), "");

    tasks.forEach((task, index) => {
      lines.push(`${index + 1}. ${task.title}`);
      lines.push(`   Type: ${TASK_TYPES[task.type].label}`);
      lines.push(`   Date: ${formatDate(task.date)}`);
      lines.push(`   Priority: ${task.priority.toUpperCase()}`);
      lines.push(`   Track: ${getTrackName(task.trackId)}`);
      lines.push(`   Status: ${task.completed ? "✓ Completed" : "○ Incomplete"}`);
      if (task.description) {
        lines.push(`   Description: ${task.description}`);
      }
      lines.push("");
    });

    const text = lines.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    downloadFile(blob, "college-organizer-tasks.txt");
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    switch (format) {
      case "json":
        exportAsJSON();
        break;
      case "csv":
        exportAsCSV();
        break;
      case "txt":
        exportAsTXT();
        break;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-export">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover-elevate cursor-pointer">
                <RadioGroupItem value="json" id="json" data-testid="radio-format-json" />
                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FileJson className="h-5 w-5" />
                  <div>
                    <div className="font-medium">JSON</div>
                    <div className="text-xs text-muted-foreground">Complete data backup</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border hover-elevate cursor-pointer">
                <RadioGroupItem value="csv" id="csv" data-testid="radio-format-csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FileText className="h-5 w-5" />
                  <div>
                    <div className="font-medium">CSV</div>
                    <div className="text-xs text-muted-foreground">Spreadsheet compatible</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border hover-elevate cursor-pointer">
                <RadioGroupItem value="txt" id="txt" data-testid="radio-format-txt" />
                <Label htmlFor="txt" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FileText className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Text</div>
                    <div className="text-xs text-muted-foreground">Human-readable format</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="text-sm text-muted-foreground">
            Exporting {tasks.length} task{tasks.length !== 1 ? "s" : ""} and {tracks.length} track{tracks.length !== 1 ? "s" : ""}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleExport} data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
