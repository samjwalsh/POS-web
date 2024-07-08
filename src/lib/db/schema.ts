import { serial, text, timestamp, integer, boolean, real, json, pgSchema, pgTable } from "drizzle-orm/pg-core";
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
export const vouchersTable = vouchersSchema.table('vouchers', {
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

export const logsSchema = pgSchema('logs_schema');
export const logsTable = logsSchema.table('logs', {
    id: serial('id').primaryKey(),
    time: timestamp('time').notNull(),
    source: text('source').notNull(),
    note: text('note'),
    json: json('json'),
    message: text('message')
})

export const usersSchema = pgSchema('users_schema');
export const usersTable = usersSchema.table('users', {
    id: text("id").primaryKey(),
    username: text('username').unique().notNull(),
    password_hash: text('password_hash').notNull()
})

export const sessionsSchema = pgSchema('sessions_schema');
export const sessionsTable = sessionsSchema.table('sessions', {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date"
    }).notNull()
})
