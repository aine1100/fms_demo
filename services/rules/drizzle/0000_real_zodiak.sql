CREATE TYPE "public"."compliance_status" AS ENUM('compliant', 'non_compliant', 'warning');--> statement-breakpoint
CREATE TYPE "public"."warning_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "compliance_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"inspector_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"status" "compliance_status" NOT NULL,
	"findings" text NOT NULL,
	"action_required" text,
	"deadline" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100),
	"document_url" varchar(500),
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warnings" (
	"id" serial PRIMARY KEY NOT NULL,
	"compliance_report_id" integer,
	"customer_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"issued_by" integer NOT NULL,
	"message" text NOT NULL,
	"severity" "warning_severity" NOT NULL,
	"is_resolved" boolean DEFAULT false,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "warnings" ADD CONSTRAINT "warnings_compliance_report_id_compliance_reports_id_fk" FOREIGN KEY ("compliance_report_id") REFERENCES "public"."compliance_reports"("id") ON DELETE no action ON UPDATE no action;