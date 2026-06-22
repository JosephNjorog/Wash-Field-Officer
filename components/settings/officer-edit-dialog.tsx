"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import type { Officer } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  region: z.string().min(2, "Region is required"),
  phone: z.string().min(6, "Phone is required"),
  email: z.string().email("Enter a valid email"),
  status: z.enum(["Active", "Offline", "Overdue"]),
  dailyTarget: z.number().int().min(1).max(20),
});

type FormValues = z.infer<typeof schema>;

export function OfficerEditDialog({
  officer,
  open,
  onOpenChange,
}: {
  officer: Officer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateOfficer = useAppStore((s) => s.updateOfficer);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (officer) {
      reset({
        name: officer.name,
        region: officer.region,
        phone: officer.phone,
        email: officer.email,
        status: officer.status,
        dailyTarget: officer.dailyTarget,
      });
    }
  }, [officer, reset]);

  async function onSubmit(values: FormValues) {
    if (!officer) return;
    setSubmitting(true);
    try {
      await updateOfficer(officer.id, values);
      toast.success(`${values.name} updated`);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to update officer", {
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
          <DialogTitle>Edit Officer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Full Name</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Region</Label>
            <Input {...register("region")} />
            {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Daily Site Target</Label>
              <Input
                type="number"
                {...register("dailyTarget", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
