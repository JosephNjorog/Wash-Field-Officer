import Link from "next/link";
import {
  Droplets,
  LayoutDashboard,
  MapPinned,
  ClipboardList,
  FileBarChart2,
  Smartphone,
  WifiOff,
  ArrowRight,
  MapPin,
  ClipboardCheck,
  Users,
  Building2,
} from "lucide-react";
import seed from "@/data/seed.json";
import type { SeedData } from "@/lib/types";
import { Button } from "@/components/ui/button";

const data = seed as SeedData;
const regionCount = new Set(data.assets.map((a) => a.region)).size;

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#roles", label: "For Your Team" },
];

const STATS = [
  { icon: Users, label: "Field Officers", value: data.officers.length },
  { icon: Building2, label: "Infrastructure Assets Tracked", value: data.assets.length },
  { icon: MapPin, label: "Regions Covered", value: regionCount },
  { icon: ClipboardCheck, label: "Inspections Logged", value: data.inspections.length },
];

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Management Dashboard",
    description:
      "Live view of active officers, open complaints, inspection targets, and infrastructure alerts in one place.",
  },
  {
    icon: MapPinned,
    title: "Asset Registry & Map",
    description:
      "Every water kiosk, borehole, pipeline, and sanitation block plotted on a live map with condition scores and history.",
  },
  {
    icon: ClipboardList,
    title: "Complaint Management",
    description:
      "Kanban-style complaint queue with SLA timers, officer assignment, and full status history per case.",
  },
  {
    icon: FileBarChart2,
    title: "Report Builder",
    description:
      "Filterable reports on officer performance, infrastructure status, and water quality — exportable to PDF or CSV.",
  },
  {
    icon: Smartphone,
    title: "Field Officer Mobile App",
    description:
      "A purpose-built mobile experience for daily site visits, inspection forms, GPS capture, and complaint resolution.",
  },
  {
    icon: WifiOff,
    title: "Offline-First Sync",
    description:
      "Officers can keep working without signal — reports queue locally and sync automatically once back online.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Officers check in on site",
    description: "Field officers open their daily task list, check in at each assigned site, and capture GPS location.",
  },
  {
    step: "02",
    title: "Inspections are submitted",
    description: "Water flow, infrastructure condition, chlorine levels, and photos are logged directly from the field.",
  },
  {
    step: "03",
    title: "Supervisors monitor in real time",
    description: "The dashboard updates live with officer activity, asset status, and any flagged infrastructure issues.",
  },
  {
    step: "04",
    title: "Complaints are resolved end-to-end",
    description: "Customer complaints move through Open → Assigned → In Progress → Resolved with full SLA tracking.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <header className="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-primary text-white">
              <Droplets className="size-4.5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">FieldWatch</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <span className="inline-flex items-center rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-secondary">
          Built for WASH institutions in Kenya &amp; East Africa
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
          Field Officer Monitoring &amp; Service Delivery Management, in One Platform
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground">
          FieldWatch gives water and sanitation institutions a single system to manage field
          inspections, infrastructure assets, customer complaints, and officer performance —
          from the field to the supervisor&apos;s desk.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild className="gap-1.5">
            <Link href="/login">
              Sign In to FieldWatch <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-white p-5">
              <stat.icon className="mx-auto size-5 text-secondary" />
              <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Everything your operation needs</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            One platform connecting field operations to management oversight, designed
            specifically for water and sanitation service delivery.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border bg-white p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand-tint text-secondary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-brand-primary py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">How FieldWatch works</h2>
            <p className="mt-3 text-sm text-white/70">
              From a field officer&apos;s GPS check-in to a supervisor&apos;s live dashboard —
              data flows through the system in four steps.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.step} className="rounded-xl bg-white/5 p-5">
                <span className="text-3xl font-bold text-white/30">{step.step}</span>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-white/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Built for both sides of the field</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Supervisors and field officers each get an experience designed for how they actually
            work.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-7">
            <div className="flex size-11 items-center justify-center rounded-lg bg-brand-tint text-secondary">
              <LayoutDashboard className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">For Supervisors</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A desktop-first command center: live officer activity, asset health across regions,
              complaint SLAs, and exportable reports — all in one dashboard.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-white p-7">
            <div className="flex size-11 items-center justify-center rounded-lg bg-brand-tint text-secondary">
              <Smartphone className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">For Field Officers</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A mobile-optimized app for daily site visits, inspection forms with GPS and photo
              capture, complaint resolution, and offline-ready syncing.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground">Ready to see FieldWatch in action?</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in as a supervisor or a field officer to explore the full prototype with real
          sample data.
        </p>
        <Button size="lg" asChild className="mt-6 gap-1.5">
          <Link href="/login">
            Sign In <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-brand-primary text-white">
              <Droplets className="size-3.5" />
            </div>
            <span className="text-sm font-semibold text-foreground">FieldWatch</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FieldWatch. Prototype build for demonstration purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
