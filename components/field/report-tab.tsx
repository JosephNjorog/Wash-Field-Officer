"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Camera, Crosshair, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

const schema = z.object({
  assetId: z.string().min(1, "Select a site"),
  water_flow_status: z.enum(["Normal", "Reduced", "No Flow"]),
  infrastructure_condition: z.enum(["Good", "Fair", "Poor", "Critical"]),
  chlorine_level: z.number().min(0, "Must be 0 or more").max(5, "Too high"),
  notes: z.string().min(5, "Add a short observation"),
});

type FormValues = z.infer<typeof schema>;

export function ReportTab() {
  const assets = useAppStore((s) => s.assets);
  const submitInspection = useAppStore((s) => s.submitInspection);
  const pendingSync = useAppStore((s) => s.pendingSync);
  const currentFieldOfficerId = useAppStore((s) => s.currentFieldOfficerId);

  const [photoCount, setPhotoCount] = useState(0);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [capturing, setCapturing] = useState(false);

  const mySites = assets.filter((a) => a.assignedOfficerId === currentFieldOfficerId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      water_flow_status: "Normal",
      infrastructure_condition: "Good",
      chlorine_level: 0.5,
      notes: "",
      assetId: "",
    },
  });

  const selectedAssetId = watch("assetId");
  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  function captureGps() {
    if (!selectedAsset) {
      toast.error("Select a site first");
      return;
    }
    setCapturing(true);
    setTimeout(() => {
      setGps({
        lat: parseFloat((selectedAsset.lat + (Math.random() - 0.5) * 0.0006).toFixed(6)),
        lng: parseFloat((selectedAsset.lng + (Math.random() - 0.5) * 0.0006).toFixed(6)),
      });
      setCapturing(false);
      toast.success("GPS location captured");
    }, 900);
  }

  function onSubmit(values: FormValues) {
    if (!gps) {
      toast.error("Capture GPS location before submitting");
      return;
    }
    submitInspection({
      assetId: values.assetId,
      water_flow_status: values.water_flow_status,
      infrastructure_condition: values.infrastructure_condition,
      chlorine_level: values.chlorine_level,
      notes: values.notes,
      photo_count: photoCount,
      gps_lat: gps.lat,
      gps_lng: gps.lng,
    });
    toast.success("Inspection report submitted and queued for sync");
    reset();
    setPhotoCount(0);
    setGps(null);
  }

  const pendingCount = pendingSync.filter((p) => p.status !== "synced").length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Submit Inspection Report</p>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            {pendingCount} pending sync
          </Badge>
        )}
      </div>

      <Card>
        <CardContent className="space-y-4 p-3.5">
          <div className="space-y-1.5">
            <Label>Site</Label>
            <Controller
              control={control}
              name="assetId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a site" />
                  </SelectTrigger>
                  <SelectContent>
                    {mySites.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assetId && <p className="text-xs text-destructive">{errors.assetId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Water Flow Status</Label>
            <Controller
              control={control}
              name="water_flow_status"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-3">
                  {["Normal", "Reduced", "No Flow"].map((v) => (
                    <label key={v} className="flex items-center gap-1.5 text-sm">
                      <RadioGroupItem value={v} /> {v}
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Infrastructure Condition</Label>
            <Controller
              control={control}
              name="infrastructure_condition"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-2 gap-2"
                >
                  {["Good", "Fair", "Poor", "Critical"].map((v) => (
                    <label key={v} className="flex items-center gap-1.5 text-sm">
                      <RadioGroupItem value={v} /> {v}
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Chlorine Level (mg/L)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("chlorine_level", { valueAsNumber: true })}
            />
            {errors.chlorine_level && (
              <p className="text-xs text-destructive">{errors.chlorine_level.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Observations</Label>
            <Textarea rows={3} placeholder="Describe site conditions..." {...register("notes")} />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Photos</Label>
            <div className="flex gap-2">
              {Array.from({ length: photoCount }).map((_, i) => (
                <div
                  key={i}
                  className="flex size-14 items-center justify-center rounded-md bg-muted text-muted-foreground"
                >
                  <Camera className="size-5" />
                </div>
              ))}
              {photoCount < 4 && (
                <button
                  type="button"
                  onClick={() => setPhotoCount((c) => c + 1)}
                  className="flex size-14 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:bg-muted"
                >
                  <Camera className="size-5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>GPS Location</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={captureGps}
              disabled={capturing}
            >
              {capturing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Crosshair className="size-3.5" />
              )}
              {gps ? "Recapture GPS" : "Capture GPS"}
            </Button>
            {gps && (
              <p className="text-xs text-muted-foreground">
                Lat {gps.lat}, Lng {gps.lng}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Submit Report
      </Button>
    </form>
  );
}
