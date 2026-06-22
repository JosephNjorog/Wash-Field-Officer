"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  region: z.string().min(2, "Region is required"),
  phone: z.string().min(6, "Phone is required"),
  email: z.string().email("Enter a valid email"),
  dailyTarget: z.number().int().min(1).max(20),
});

type FormValues = z.infer<typeof schema>;

export function OfficerAddDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createOfficer = useAppStore((s) => s.createOfficer);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", region: "", phone: "", email: "", dailyTarget: 6 },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await createOfficer(values);
      toast.success(`${values.name} added to the team`);
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to add officer", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Field Officer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Full Name</Label>
            <Input placeholder="e.g. Susan Wambui" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Region</Label>
            <Input placeholder="e.g. Nakuru Town" {...register("region")} />
            {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input placeholder="+254 7XX XXX XXX" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Daily Site Target</Label>
              <Input type="number" {...register("dailyTarget", { valueAsNumber: true })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input placeholder="name@fieldwatch.go.ke" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Officer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
