import { serial, text, timestamp, integer, boolean, real, pgSchema } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

export const ordersSchema = pgSchema("orders_schema");
export const paymentMethod = ordersSchema.enum('paymentMethod', ['Card', 'Cash']);
export const orders = ordersSchema.table('orders', {
    id: text('id').primaryKey(),
    time: timestamp('time').notNull(),
    shop: text('shop').notNull(),
    till: integer('till').notNull(),
    deleted: boolean('deleted').notNull(),
    eod: boolean('eod').notNull(),
    subtotal: real('subtotal').notNull(),
    paymentMethod: paymentMethod('payment_method').notNull(),
});

export const orderRelations = relations(orders, ({ many }) => ({
    items: many(items),
}));

export const itemsSchema = pgSchema('items_schema');
export const items = itemsSchema.table('items', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    price: real('price').notNull(),
    quantity: integer('quantity').notNull(),
    addons: text('addons').array().notNull(),
    orderId: text('order_id').notNull()
})

export const itemsRelations = relations(items, ({ one }) => ({
    order: one(orders, {
        fields: [items.orderId],
        references: [orders.id],
    }),
}));

export const vouchersSchema = pgSchema('vouchers_schema');
export const vouchers = vouchersSchema.table('vouchers', {
    dateCreated: timestamp('date_created').notNull(),
    shopCreated: text('shop_created').notNull(),
    tillCreated: text('till_created').notNull(),
    value: real('value').notNull(),
    code: text('code').primaryKey(),
    redeemed: boolean('redeemed').notNull(),
    dateRedeemed: timestamp('date_redeemed'),
    shopRedeemed: text('shop_redeemed'),
    tillRedeemed: text('till_redeemed')
})