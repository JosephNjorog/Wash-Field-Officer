CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"report_type" text NOT NULL,
	"format" text NOT NULL,
	"filters" jsonb NOT NULL,
	"generated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
