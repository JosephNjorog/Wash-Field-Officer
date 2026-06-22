CREATE TYPE "public"."asset_status" AS ENUM('functional', 'needs-repair', 'non-functional');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('water_kiosk', 'borehole', 'pipeline', 'sanitation_block');--> statement-breakpoint
CREATE TYPE "public"."complaint_category" AS ENUM('No Water', 'Low Pressure', 'Dirty Water', 'Broken Kiosk', 'Sanitation Issue');--> statement-breakpoint
CREATE TYPE "public"."complaint_status" AS ENUM('open', 'assigned', 'in-progress', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."infrastructure_condition" AS ENUM('Good', 'Fair', 'Poor', 'Critical');--> statement-breakpoint
CREATE TYPE "public"."officer_status" AS ENUM('Active', 'Offline', 'Overdue');--> statement-breakpoint
CREATE TYPE "public"."water_flow_status" AS ENUM('Normal', 'Reduced', 'No Flow');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "asset_type" NOT NULL,
	"region" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"status" "asset_status" NOT NULL,
	"last_inspected" timestamp with time zone NOT NULL,
	"condition_score" integer NOT NULL,
	"assigned_officer_id" text
);
--> statement-breakpoint
CREATE TABLE "check_ins" (
	"id" serial PRIMARY KEY NOT NULL,
	"officer_id" text NOT NULL,
	"asset_id" text NOT NULL,
	"checked_in_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" text PRIMARY KEY NOT NULL,
	"category" "complaint_category" NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"region" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"status" "complaint_status" NOT NULL,
	"assigned_officer_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolution_note" text
);
--> statement-breakpoint
CREATE TABLE "daily_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"officer_id" text NOT NULL,
	"date" date NOT NULL,
	"sites_visited" integer NOT NULL,
	"reports_submitted" integer NOT NULL,
	"complaints_handled" integer NOT NULL,
	"distance_covered_km" numeric(6, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" text PRIMARY KEY NOT NULL,
	"officer_id" text NOT NULL,
	"asset_id" text NOT NULL,
	"water_flow_status" "water_flow_status" NOT NULL,
	"infrastructure_condition" "infrastructure_condition" NOT NULL,
	"chlorine_level" numeric(5, 2) NOT NULL,
	"notes" text NOT NULL,
	"photo_count" integer DEFAULT 0 NOT NULL,
	"gps_lat" double precision NOT NULL,
	"gps_lng" double precision NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"synced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "officers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region" text NOT NULL,
	"phone" text NOT NULL,
	"initials" text NOT NULL,
	"email" text NOT NULL,
	"status" "officer_status" NOT NULL,
	"daily_target" integer NOT NULL,
	"last_check_in" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_assigned_officer_id_officers_id_fk" FOREIGN KEY ("assigned_officer_id") REFERENCES "public"."officers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_officer_id_officers_id_fk" FOREIGN KEY ("officer_id") REFERENCES "public"."officers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_officer_id_officers_id_fk" FOREIGN KEY ("assigned_officer_id") REFERENCES "public"."officers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD CONSTRAINT "daily_summaries_officer_id_officers_id_fk" FOREIGN KEY ("officer_id") REFERENCES "public"."officers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_officer_id_officers_id_fk" FOREIGN KEY ("officer_id") REFERENCES "public"."officers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_summaries_officer_date_idx" ON "daily_summaries" USING btree ("officer_id","date");