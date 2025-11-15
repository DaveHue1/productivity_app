import { useState, useEffect } from "react";
import { Project, InsertProject, Track } from "@shared/schema";
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

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  tracks: Track[];
  onSave: (project: InsertProject | (Project & Partial<InsertProject>)) => void;
}

const PRESET_COLORS = [
  "#8b5cf6", // Purple
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#10b981", // Green
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

export function ProjectDialog({ open, onOpenChange, project, tracks, onSave }: ProjectDialogProps) {
  const [formData, setFormData] = useState<InsertProject>({
    name: "",
    description: "",
    trackId: tracks[0]?.id || "",
    color: PRESET_COLORS[0],
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        trackId: project.trackId,
        color: project.color || PRESET_COLORS[0],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        trackId: tracks[0]?.id || "",
        color: PRESET_COLORS[0],
      });
    }
  }, [project, open, tracks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (project) {
      onSave({ ...project, ...formData });
    } else {
      onSave(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-project">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-project-name"
              placeholder="e.g., Final Project, Research Paper"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="textarea-project-description"
              placeholder="Project details..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="track">Track *</Label>
            <Select
              value={formData.trackId}
              onValueChange={(value) => setFormData({ ...formData, trackId: value })}
            >
              <SelectTrigger id="track" data-testid="select-project-track">
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id} data-testid={`option-track-${track.id}`}>
                    <span style={{ color: track.color }}>●</span> {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color (Optional)</Label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-10 w-10 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: (formData.color || PRESET_COLORS[0]) === color ? "hsl(var(--ring))" : "transparent",
                  }}
                  onClick={() => setFormData({ ...formData, color })}
                  data-testid={`color-${color}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Label htmlFor="customColor" className="text-sm">Custom:</Label>
              <Input
                id="customColor"
                type="color"
                value={formData.color || PRESET_COLORS[0]}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-20 h-10"
                data-testid="input-custom-color"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save-project">
              {project ? "Update Project" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
