import { db } from "../db";
import { gt, lt, and, eq, sum, between } from "drizzle-orm";
import { ordersTable } from "../schema";


export const getLast30Days = async () => {
    const output: Output = [];
    let dateBegin = new Date((new Date()).setUTCHours(0, 0, 0, 0));
    let dateEnd = new Date((new Date()).setUTCHours(23, 59, 59, 999));
    const shopsRes = await db.selectDistinct({ shop: ordersTable.shop }).from(ordersTable).where(and(gt(ordersTable.time, new Date(dateBegin.getTime() - 30 * 24 * 60 * 60 * 1000)), lt(ordersTable.time, dateEnd)));

    const shops = [];
    for (const shop of shopsRes) {
        shops.push(shop.shop);
    }

    const oneDay = new Date(86400000);
    // const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


    for (let day = 0; day < 30; day++) {

        // const dayName = `${days[dateBegin.getDay()]} ${dateBegin.getDate()}/${dateBegin.getMonth() + 1}`
        try {
            for (const shop of shops) {
                const shopTotal = await db.select({ value: sum(ordersTable.subtotal) }).from(ordersTable).where(
                    and(
                        and(
                            eq(ordersTable.shop, shop),
                            eq(ordersTable.deleted, false)),
                        between(ordersTable.time, dateBegin, dateEnd)
                    )
                );
                const total = parseInt(shopTotal[0].value ?? '0');
                output.push({ day: dateBegin, shop, value:total })
            }

        } catch (e) {
            console.log(e);


        }

        dateBegin = new Date(dateBegin.getTime() - oneDay.getTime())
        dateEnd = new Date(dateEnd.getTime() - oneDay.getTime());

    }
    return output;
}


export type Output = Array<Shop>

type Shop = {
    day: Date,
    shop: string,
    value: number
}