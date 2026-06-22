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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import type { Asset } from "@/lib/types";

export function AssignInspectionDialog({
  asset,
  open,
  onOpenChange,
}: {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const officers = useAppStore((s) => s.officers);
  const updateAsset = useAppStore((s) => s.updateAsset);
  const [officerId, setOfficerId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  if (!asset) return null;

  async function handleAssign() {
    if (!officerId || !asset) return;
    setSubmitting(true);
    try {
      await updateAsset(asset.id, { assignedOfficerId: officerId });
      const officer = officers.find((o) => o.id === officerId);
      toast.success(`${officer?.name} assigned to inspect ${asset.name}`);
      onOpenChange(false);
      setOfficerId("");
    } catch (err) {
      toast.error("Failed to assign inspection", {
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
          <DialogTitle>Assign Inspection</DialogTitle>
          <DialogDescription>
            Choose a field officer to inspect <span className="font-medium">{asset.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label className="text-xs">Field Officer</Label>
          <Select value={officerId} onValueChange={setOfficerId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an officer" />
            </SelectTrigger>
            <SelectContent>
              {officers.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name} — {o.region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!officerId || submitting} onClick={handleAssign}>
            {submitting ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
