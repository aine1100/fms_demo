CREATE TYPE "public"."extinguisher_status" AS ENUM('active', 'expired', 'maintenance', 'decommissioned');--> statement-breakpoint
CREATE TYPE "public"."extinguisher_type" AS ENUM('water', 'foam', 'co2', 'dry_powder', 'wet_chemical');--> statement-breakpoint
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
ALTER TABLE "extinguishers" ADD CONSTRAINT "extinguishers_catalog_item_id_extinguisher_catalog_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."extinguisher_catalog"("id") ON DELETE no action ON UPDATE no action;