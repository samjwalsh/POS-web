CREATE SCHEMA "items_schema";
--> statement-breakpoint
CREATE SCHEMA "orders_schema";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "orders_schema"."paymentMethod" AS ENUM('card', 'cash');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "items_schema"."items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" real NOT NULL,
	"quantity" integer NOT NULL,
	"addons" text[] NOT NULL,
	"order_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders_schema"."orders" (
	"id" text PRIMARY KEY NOT NULL,
	"time" timestamp NOT NULL,
	"shop" text NOT NULL,
	"till" integer NOT NULL,
	"deleted" boolean NOT NULL,
	"eod" boolean NOT NULL,
	"subtotal" real NOT NULL,
	"payment_method" "orders_schema"."paymentMethod" NOT NULL
);
