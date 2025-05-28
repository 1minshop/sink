ALTER TABLE "products" ADD COLUMN "stripe_product_id" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stripe_price_id" text;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_stripe_product_id_unique" UNIQUE("stripe_product_id");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_stripe_price_id_unique" UNIQUE("stripe_price_id");