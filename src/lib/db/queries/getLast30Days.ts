import { db } from "../db";
import { gt, lt, and, eq, avg, sum, between } from "drizzle-orm";
import { ordersTable } from "../schema";

export const getLast30Days = async () => {

    const output: Output = {
        series: [], xaxis: { categories: [] }
    };

    let dateBegin = new Date((new Date()).setUTCHours(0, 0, 0, 0));
    let dateEnd = new Date((new Date()).setUTCHours(23, 59, 59, 999));
    let shopsRes = await db.selectDistinct({ shop: ordersTable.shop }).from(ordersTable).where(and(gt(ordersTable.time, new Date(dateBegin.getTime() - 30 * 24 * 60 * 60 * 1000)), lt(ordersTable.time, dateEnd)));

    const shops = [];
    for (const shop of shopsRes) {
        shops.push(shop.shop);
    }

    const oneDay = new Date(86400000)
    for (const shop of shops) {
        let dateBegin = new Date((new Date()).setUTCHours(0, 0, 0, 0));
        let dateEnd = new Date((new Date()).setUTCHours(23, 59, 59, 999));


        let series: Series = { name: shop, data: [] };

        const oneDay = new Date(86400000)
        for (let day = 0; day < 30; day++) {
            try {
                const shopTotal = await db.select({ value: sum(ordersTable.subtotal) }).from(ordersTable).where(
                    and(
                        and(
                            eq(ordersTable.shop, shop),
                            eq(ordersTable.deleted, false)),
                        between(ordersTable.time, dateBegin, dateEnd)
                    )
                );
                series.data.push(Math.round(parseFloat(shopTotal[0].value ?? '0')))

            } catch (e) {
                console.log(e);


            }

            dateBegin = new Date(dateBegin.getTime() - oneDay.getTime())
            dateEnd = new Date(dateEnd.getTime() - oneDay.getTime());

        }

        output.series.push(series);
    }

    dateBegin = new Date((new Date()).setUTCHours(0, 0, 0, 0));
    dateEnd = new Date((new Date()).setUTCHours(23, 59, 59, 999));
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat']
    for (let day = 0; day < 30; day++) {

        output.xaxis.categories.push(`${days[dateBegin.getDay()]} ${dateBegin.getDate()}/${dateBegin.getMonth() + 1}`)

        dateBegin = new Date(dateBegin.getTime() - oneDay.getTime())

    }

    return output;
}

export type Output = {
    series: Array<Series>,
    xaxis: XAxis
};

type Series = {
    name: string,
    data: Array<number>
}

type XAxis = {
    categories: Array<string>
}