DO $$ BEGIN
 ALTER TABLE "items_schema"."items" ADD CONSTRAINT "items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders_schema"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
