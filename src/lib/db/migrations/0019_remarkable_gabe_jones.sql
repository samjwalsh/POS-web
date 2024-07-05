CREATE SCHEMA "logs_schema";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logs_schema"."logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"time" timestamp NOT NULL,
	"source" text NOT NULL,
	"note" text,
	"json" json,
	"message" text
);
