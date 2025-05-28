ALTER TABLE "orders" ADD COLUMN "payment_method" varchar(20) DEFAULT 'qr_code' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripe_session_id" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "qr_code_image_url" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "qr_code_payment_name" varchar(255);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "qr_code_payment_details" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "enable_qr_payment" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "enable_stripe_payment" boolean DEFAULT true NOT NULL;