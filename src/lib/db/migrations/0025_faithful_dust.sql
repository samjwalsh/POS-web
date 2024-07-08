CREATE SCHEMA "sessions_schema";
--> statement-breakpoint
CREATE SCHEMA "users_schema";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions_schema"."sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_schema"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text,
	"password_hash" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions_schema"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_schema"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
