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
import type { Asset, ComplaintCategory } from "@/lib/types";

const CATEGORIES: ComplaintCategory[] = [
  "No Water",
  "Low Pressure",
  "Dirty Water",
  "Broken Kiosk",
  "Sanitation Issue",
];

export function LogIssueDialog({
  asset,
  open,
  onOpenChange,
}: {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createComplaint = useAppStore((s) => s.createComplaint);
  const [category, setCategory] = useState<ComplaintCategory | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!asset) return null;

  async function handleSubmit() {
    if (!asset || !category || !description.trim()) return;
    setSubmitting(true);
    try {
      await createComplaint({
        category,
        description,
        address: asset.name,
        region: asset.region,
        lat: asset.lat,
        lng: asset.lng,
        assignedOfficerId: asset.assignedOfficerId,
        assetId: asset.id,
      });
      toast.success(`Issue logged for ${asset.name}`);
      onOpenChange(false);
      setCategory("");
      setDescription("");
    } catch (err) {
      toast.error("Failed to log issue", {
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
          <DialogTitle>Log Issue</DialogTitle>
          <DialogDescription>
            Record a new issue for <span className="font-medium">{asset.name}</span>. This creates
            a complaint that appears in the Complaint Management Queue.
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
            <Label className="text-xs">Description</Label>
            <Textarea
              rows={3}
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!category || !description.trim() || submitting} onClick={handleSubmit}>
            {submitting ? "Logging..." : "Log Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
