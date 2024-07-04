import { serial, text, timestamp, integer, boolean, real, pgSchema } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

export const ordersSchema = pgSchema("orders_schema");
export const paymentMethod = ordersSchema.enum('paymentMethod', ['Card', 'Cash']);
export const ordersTable = ordersSchema.table('orders', {
    id: text('id').primaryKey(),
    time: timestamp('time').notNull(),
    shop: text('shop').notNull(),
    till: integer('till').notNull(),
    deleted: boolean('deleted').notNull(),
    eod: boolean('eod').notNull(),
    rba: boolean('rba').default(false),
    subtotal: real('subtotal').notNull(),
    paymentMethod: paymentMethod('payment_method').notNull(),
});

export const orderRelations = relations(ordersTable, ({ many }) => ({
    items: many(itemsTable),
}));

export const itemsSchema = pgSchema('items_schema');
export const itemsTable = itemsSchema.table('items', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    price: real('price').notNull(),
    quantity: integer('quantity').notNull(),
    addons: text('addons').array().notNull(),
    orderId: text('order_id').notNull()
})

export const itemsRelations = relations(itemsTable, ({ one }) => ({
    order: one(ordersTable, {
        fields: [itemsTable.orderId],
        references: [ordersTable.id],
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