ALTER TABLE "extinguisher_catalog" ADD COLUMN "quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "extinguisher_catalog" ADD COLUMN "manufacture_date" timestamp;--> statement-breakpoint
ALTER TABLE "extinguisher_catalog" ADD COLUMN "expiry_date" timestamp;