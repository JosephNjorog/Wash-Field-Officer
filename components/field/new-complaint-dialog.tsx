"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import type { ComplaintCategory } from "@/lib/types";

const CATEGORIES: ComplaintCategory[] = [
  "No Water",
  "Low Pressure",
  "Dirty Water",
  "Broken Kiosk",
  "Sanitation Issue",
];

export function NewComplaintDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const officers = useAppStore((s) => s.officers);
  const assets = useAppStore((s) => s.assets);
  const currentFieldOfficerId = useAppStore((s) => s.currentFieldOfficerId);
  const createComplaint = useAppStore((s) => s.createComplaint);

  const [category, setCategory] = useState<ComplaintCategory | "">("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const officer = officers.find((o) => o.id === currentFieldOfficerId);

  async function handleSubmit() {
    if (!officer || !category || !address.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      const myAsset = assets.find((a) => a.assignedOfficerId === officer.id);
      const coords = await captureCoords(myAsset);
      await createComplaint({
        category,
        description,
        address,
        region: officer.region,
        lat: coords.lat,
        lng: coords.lng,
        assignedOfficerId: officer.id,
      });
      toast.success("Complaint logged");
      onOpenChange(false);
      setCategory("");
      setAddress("");
      setDescription("");
    } catch (err) {
      toast.error("Failed to log complaint", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Log New Complaint</DialogTitle>
          <DialogDescription>
            Report a new issue you&apos;ve spotted in the field. It will be assigned to you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ComplaintCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Location / Address</Label>
            <Input
              placeholder="e.g. Kibera Drive kiosk"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              rows={3}
              placeholder="Describe what you observed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!category || !address.trim() || !description.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Logging..." : "Log Complaint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function captureCoords(fallbackAsset?: { lat: number; lng: number }): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(fallbackAsset ?? { lat: 0, lng: 0 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(fallbackAsset ?? { lat: 0, lng: 0 }),
      { timeout: 5000 }
    );
  });
}
