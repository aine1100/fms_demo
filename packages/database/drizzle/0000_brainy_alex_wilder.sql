CREATE TYPE "public"."compliance_status" AS ENUM('compliant', 'non_compliant', 'warning');--> statement-breakpoint
CREATE TYPE "public"."extinguisher_status" AS ENUM('active', 'expired', 'maintenance', 'decommissioned');--> statement-breakpoint
CREATE TYPE "public"."extinguisher_type" AS ENUM('water', 'foam', 'co2', 'dry_powder', 'wet_chemical');--> statement-breakpoint
CREATE TYPE "public"."inspection_result" AS ENUM('passed', 'failed', 'requires_maintenance');--> statement-breakpoint
CREATE TYPE "public"."inspection_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('pending', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('seen', 'unseen');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('expiry', 'inspection', 'payment', 'rules', 'general');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'bank_transfer', 'mobile_money', 'card');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('completed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'company', 'customer', 'inspector');--> statement-breakpoint
CREATE TYPE "public"."warning_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"address" text,
	"logo" varchar(500),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_email_unique" UNIQUE("email")
);
--> statement-breakpoint
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
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"company_id" integer,
	"business_name" varchar(255),
	"contact_person" varchar(255),
	"address" text,
	"phone" varchar(50),
	"city" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extinguisher_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "extinguisher_type" NOT NULL,
	"capacity" varchar(50) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"image_url" varchar(500),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extinguishers" (
	"id" serial PRIMARY KEY NOT NULL,
	"serial_number" varchar(100) NOT NULL,
	"catalog_item_id" integer,
	"company_id" integer NOT NULL,
	"customer_id" integer,
	"type" "extinguisher_type" NOT NULL,
	"capacity" varchar(50) NOT NULL,
	"manufacture_date" timestamp NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"last_inspection_date" timestamp,
	"next_inspection_date" timestamp,
	"status" "extinguisher_status" DEFAULT 'active',
	"location" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "extinguishers_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"company_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"extinguisher_id" integer,
	"catalog_item_id" integer,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" "invoice_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"company_id" integer,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"status" "notification_status" DEFAULT 'unseen',
	"email_sent" boolean DEFAULT false,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"receipt_number" varchar(50) NOT NULL,
	"transaction_ref" varchar(255),
	"notes" text,
	"status" "payment_status" DEFAULT 'completed',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
-- refresh_tokens table removed; using Redis for refresh token storage
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
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"company_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
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
ALTER TABLE "compliance_reports" ADD CONSTRAINT "compliance_reports_inspector_id_users_id_fk" FOREIGN KEY ("inspector_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_reports" ADD CONSTRAINT "compliance_reports_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_reports" ADD CONSTRAINT "compliance_reports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extinguisher_catalog" ADD CONSTRAINT "extinguisher_catalog_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extinguishers" ADD CONSTRAINT "extinguishers_catalog_item_id_extinguisher_catalog_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."extinguisher_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extinguishers" ADD CONSTRAINT "extinguishers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extinguishers" ADD CONSTRAINT "extinguishers_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_extinguisher_id_extinguishers_id_fk" FOREIGN KEY ("extinguisher_id") REFERENCES "public"."extinguishers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_inspector_id_users_id_fk" FOREIGN KEY ("inspector_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_extinguisher_id_extinguishers_id_fk" FOREIGN KEY ("extinguisher_id") REFERENCES "public"."extinguishers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_catalog_item_id_extinguisher_catalog_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."extinguisher_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- refresh_tokens FK removed (moved to Redis storage)--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warnings" ADD CONSTRAINT "warnings_compliance_report_id_compliance_reports_id_fk" FOREIGN KEY ("compliance_report_id") REFERENCES "public"."compliance_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warnings" ADD CONSTRAINT "warnings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warnings" ADD CONSTRAINT "warnings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warnings" ADD CONSTRAINT "warnings_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;