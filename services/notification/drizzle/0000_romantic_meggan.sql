CREATE TYPE "public"."notification_status" AS ENUM('seen', 'unseen');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('expiry', 'inspection', 'payment', 'rules', 'general');--> statement-breakpoint
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
