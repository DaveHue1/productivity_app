import { useState, useEffect } from "react";
import { Track, InsertTrack } from "@shared/schema";
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

interface TrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track?: Track;
  onSave: (track: InsertTrack | (Track & Partial<InsertTrack>)) => void;
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

export function TrackDialog({ open, onOpenChange, track, onSave }: TrackDialogProps) {
  const [formData, setFormData] = useState<InsertTrack>({
    name: "",
    color: PRESET_COLORS[0],
  });

  useEffect(() => {
    if (track) {
      setFormData({ name: track.name, color: track.color });
    } else {
      setFormData({ name: "", color: PRESET_COLORS[0] });
    }
  }, [track, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (track) {
      onSave({ ...track, ...formData });
    } else {
      onSave(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-track">
        <DialogHeader>
          <DialogTitle>{track ? "Edit Track" : "Create New Track"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Track Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-track-name"
              placeholder="e.g., Computer Science, Mathematics"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-10 w-10 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: formData.color === color ? "hsl(var(--ring))" : "transparent",
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
                value={formData.color}
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
            <Button type="submit" data-testid="button-save-track">
              {track ? "Update Track" : "Create Track"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
