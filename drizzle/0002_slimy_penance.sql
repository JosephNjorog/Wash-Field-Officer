ALTER TYPE "public"."asset_status" ADD VALUE 'decommissioned';--> statement-breakpoint
ALTER TYPE "public"."officer_status" ADD VALUE 'Inactive';--> statement-breakpoint
CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
