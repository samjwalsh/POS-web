CREATE SCHEMA "vouchers_schema";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vouchers_schema"."vouchers" (
	"date_created" date NOT NULL,
	"shop_created" text NOT NULL,
	"till_created" text NOT NULL,
	"value" real NOT NULL,
	"code" text PRIMARY KEY NOT NULL,
	"redeemed" boolean NOT NULL,
	"date_redeemed" date,
	"shop_redeemed" text,
	"till_redeemed" text
);
