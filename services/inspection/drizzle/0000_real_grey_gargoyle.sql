CREATE TYPE "public"."inspection_result" AS ENUM('passed', 'failed', 'requires_maintenance');--> statement-breakpoint
CREATE TYPE "public"."inspection_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"extinguisher_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"inspector_id" integer,
	"customer_id" integer,
	"scheduled_date" timestamp NOT NULL,
	"completed_date" timestamp,
	"status" "inspection_status" DEFAULT 'scheduled',
	"result" "inspection_result",
	"remarks" text,
	"location" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
