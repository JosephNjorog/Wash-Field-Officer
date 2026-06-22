"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, LayoutDashboard, MapPinned, ClipboardList, Smartphone } from "lucide-react";
import seed from "@/data/seed.json";
import type { SeedData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/lib/auth-store";

const officers = (seed as SeedData).officers;

const FEATURES = [
  { icon: LayoutDashboard, text: "Real-time supervisor dashboard with live officer activity" },
  { icon: MapPinned, text: "Map-based infrastructure asset registry across regions" },
  { icon: ClipboardList, text: "Kanban complaint workflows with SLA tracking" },
  { icon: Smartphone, text: "Offline-ready field officer mobile experience" },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [officerId, setOfficerId] = useState(officers[0].id);

  function signInAsSupervisor() {
    login({ role: "supervisor", officerId: null, name: "James Kariuki" });
    router.push("/dashboard");
  }

  function signInAsOfficer() {
    const officer = officers.find((o) => o.id === officerId);
    if (!officer) return;
    login({ role: "officer", officerId: officer.id, name: officer.name });
    router.push("/field");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-brand-primary p-10 text-white">
        <a href="/" className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
            <Droplets className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">FieldWatch</span>
        </a>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            WASH Field Officer Monitoring &amp; Service Delivery Management
          </h1>
          <p className="max-w-md text-sm text-white/70">
            A unified platform for water and sanitation institutions across Kenya and East
            Africa to digitally manage field operations, infrastructure, and service quality.
          </p>
          <div className="space-y-3 pt-2">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <f.icon className="size-4" />
                </div>
                <p className="text-sm text-white/80">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} FieldWatch. Prototype build for demonstration purposes.
        </p>
      </div>

      <div className="flex items-center justify-center bg-brand-surface p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-semibold text-foreground">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Choose your role to continue to FieldWatch.
            </p>
          </div>

          <Tabs defaultValue="supervisor">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
              <TabsTrigger value="officer">Field Officer</TabsTrigger>
            </TabsList>

            <TabsContent value="supervisor" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Sign in as the management supervisor to access the dashboard, asset registry,
                complaints queue, and reports.
              </p>
              <div className="rounded-md border border-border bg-white p-3">
                <p className="text-sm font-medium text-foreground">James Kariuki</p>
                <p className="text-xs text-muted-foreground">Supervisor · Head Office</p>
              </div>
              <Button className="w-full" onClick={signInAsSupervisor}>
                Sign in as Supervisor
              </Button>
            </TabsContent>

            <TabsContent value="officer" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Sign in as a field officer to access the mobile inspection and complaints view.
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs">Select Officer</Label>
                <Select value={officerId} onValueChange={setOfficerId}>
                  <SelectTrigger>
                    <SelectValue />
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
              <Button className="w-full" onClick={signInAsOfficer}>
                Sign in as Field Officer
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
