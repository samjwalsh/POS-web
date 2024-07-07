import { db } from "../db";
import { gt, lt, and } from "drizzle-orm";
import {ordersTable } from "../schema";

export const getRev = async (begin: Date, end: Date) => {


  const orders = await db.select().from(ordersTable).where(and(gt(ordersTable.time, begin), lt(ordersTable.time, end)))

  const shops: Array<string> = [];
  const output: Output = { total: 0, cashTotal: 0, cardTotal: 0, orders: 0, shops: [] };

  let orderIndex = 0;
  const ordersLength = orders.length;
  while (orderIndex < ordersLength) {
    const order = orders[orderIndex];
    orderIndex++;
    if (order.deleted) continue;
    if (!order.rba) { output.orders++ };

    if (!shops.includes(order.shop)) {
      output.shops.push({
        name: order.shop,
        total: 0,
        cashTotal: 0,
        cardTotal: 0,
      });
      shops.push(order.shop);
    }

    const shopOutput = output.shops.find(shop => shop.name === order.shop)
    if (shopOutput === undefined) continue;
    if (order.paymentMethod === 'Card') { shopOutput.cardTotal += order.subtotal; output.cardTotal += order.subtotal }
    else { shopOutput.cashTotal += order.subtotal; output.cashTotal += order.subtotal }

  }
  output.total = output.cardTotal + output.cashTotal;
  return output;

}


type Output = {
  total: number,
  cashTotal: number,
  cardTotal: number,
  shops: Array<ShopOutput>,
  orders: number
}
type ShopOutput = {
  name: string,
  total: number,
  cashTotal: number,
  cardTotal: number
}