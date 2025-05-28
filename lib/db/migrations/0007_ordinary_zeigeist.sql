ALTER TABLE "orders" ADD COLUMN "contact_number" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_address" text;--> statement-breakpoint
UPDATE "orders" SET "contact_number" = '' WHERE "contact_number" IS NULL;--> statement-breakpoint
UPDATE "orders" SET "delivery_address" = '' WHERE "delivery_address" IS NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "contact_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "delivery_address" SET NOT NULL;