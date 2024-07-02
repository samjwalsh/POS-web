import TodayOrder from "$lib/models/todaysorders/TodayOrder";
import Day from "$lib/models/daySheets/Day";

import { db } from "./db";
import { orders } from "./schema";

const order =

{
  id: "1719912394875.7797.1.898",
  time: new Date("2024-07-02T09:26:34.882Z"),
  shop: "Main",
  till: 1,
  deleted: false,
  eod: false,
  subtotal: 16,
  paymentMethod: "Card",
  items: [
    {
      name: "Sundae",
      price: 4.5,
      quantity: 2,
      addons: [
        "Flake"
      ],
    },
    {
      name: "Cone",
      price: 3.5,
      quantity: 2,
      addons: [
        "Flake",
        "Toppings"
      ],
    }
  ],
}
db.insert(orders).values({
  id: "1719912394875.7797.1.898",
  time: new Date("2024-07-02T09:26:34.882Z"),
  shop: "Main",
  till: 1,
  deleted: false,
  eod: false,
  subtotal: 16,
  paymentMethod: "Card"

})

export const getDailyRev = async () => {

























  const orders: Array<Order> = await TodayOrder.find();

  const date = new Date().toISOString().split('T')[0]
  const daySheet = await Day.findOne({ date })

  if (daySheet) {
    for (let shopIndex = 0; shopIndex++; shopIndex < daySheet.shops.length) {
      orders.push(...daySheet.shops[0].orders)
    }
  }

  const output: Output = { total: 0, cashTotal: 0, cardTotal: 0, shops: [], orders: 0 };

  const shops: Array<string> = [];
  let currOrder = 0;
  const totalOrders = orders.length;
  while (currOrder < totalOrders) {
    const order = orders[currOrder];
    currOrder++;
    if (order.deleted) continue;

    if (!shops.includes(order.shop)) {
      output.shops.push({
        name: order.shop,
        total: 0,
        cashTotal: 0,
        cardTotal: 0,
      });
      shops.push(order.shop);
    }

    for (const includedShop of output.shops) {
      if ((includedShop.name === order.shop)) {
        if (order.paymentMethod === 'Card') {
          includedShop.cardTotal += order.subtotal;
        } else {
          includedShop.cashTotal += order.subtotal;
        }
      }
    }
  }

  for (const shop of output.shops) {
    output.cashTotal += shop.cashTotal;
    output.cardTotal += shop.cardTotal;

    shop.total = shop.cashTotal + shop.cardTotal;
  }

  output.total = output.cashTotal + output.cardTotal;
  output.orders = orders.length;

  return output;

}

export const getThisWeekRev = () => {

}

const getZ = async (range, options) => {
  let { start, end } = range;
  if (!end) end = start;
  const days = await Day.find({
    date: {
      $gte: start,
      $lte: end,
    },
  });

  if (days.length === 0) return {};

  const output: Output = { total: 0, cashTotal: 0, cardTotal: 0, shops: [], orders: 0 };

  const shops: Array<string> = [];
  let currDay = 0;
  const totalDays = days.length;
  while (currDay < totalDays) {
    const daySheet = days[currDay];
    currDay++;

    let currShop = 0;
    const totalShops = daySheet.shops.length;
    while (currShop < totalShops) {
      const shop = daySheet.shops[currShop];
      currShop++;

      const { shopCashTotal, shopCardTotal } = addOrders(shop.orders);

      if (!shops.includes(shop.shop)) {
        output.shops.push({
          name: shop.shop,
          total: 0,
          cashTotal: 0,
          cardTotal: 0,
        });
        shops.push(shop.shop);
      }
      for (const includedShop of output.shops) {
        if (includedShop.name === shop.shop) {
          includedShop.cashTotal += shopCashTotal;
          includedShop.cardTotal += shopCardTotal;
        }
      }
    }
  }

  for (const shop of output.shops) {
    output.cashTotal += shop.cashTotal;
    output.cardTotal += shop.cardTotal;

    shop.total = shop.cashTotal + shop.cardTotal;
  }

  output.total = output.cashTotal + output.cardTotal;

  return output;
};

const addOrders = (orders: Array<Order>) => {
  let shopCashTotal = 0;
  let shopCardTotal = 0;

  let currOrder = 0;
  const totalOrders = orders.length;
  while (currOrder < totalOrders) {
    const order = orders[currOrder];
    currOrder++;
    if (order.deleted) continue;

    if (order.paymentMethod === 'Card') {
      shopCardTotal += order.subtotal;
    } else {
      shopCashTotal += order.subtotal;
    }
  }
  return { shopCashTotal, shopCardTotal };
};


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

type Order = {
  id: string,
  time: Date,
  shop: string,
  till: number,
  deleted: boolean,
  subtotal: number,
  paymentMethod: string,
  items: Array<Item>
}

type Item = {
  name: string,
  price: number,
  quantity: number,
  addons: Array<string>
}