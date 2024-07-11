import { db } from "../db";
import { between, and, eq } from "drizzle-orm";
import { ordersTable } from "../schema";

export const getRollingRevenue = async () => {
    const now = new Date();
    const lastHour = new Date(now.getTime() - (1000 * 60 * 60));

    const shopsRes = await db.selectDistinct({ shop: ordersTable.shop }).from(ordersTable).where(between(ordersTable.time, lastHour, now));

    const shops = [];
    for (const shop of shopsRes) {
        shops.push(shop.shop);
    }

    const orders = await db.select({ subtotal: ordersTable.subtotal, shop: ordersTable.shop, time: ordersTable.time }).from(ordersTable).where(and(and(eq(ordersTable.rba, false), eq(ordersTable.deleted, false)), between(ordersTable.time, lastHour, now)));

    const output: Array<RollingRevenue> = [];

    for (const shop of shops) {
        const shopOrders = orders.filter(order => order.shop === shop)
        let rollingRevenue = 0;
        for (let orderIndex = 0; orderIndex < shopOrders.length; orderIndex++) {
            const order = shopOrders[orderIndex];
            const delay = Date.now() - new Date(order.time).getTime();
            const weight = (-2 * delay) / (60 * 60 * 1000) + 2;
            rollingRevenue += weight * order.subtotal;
        }
        output.push({ shop, rollingRevenue })
    }
    return output;
}

export type RollingRevenue = {
    shop: string,
    rollingRevenue: number
}