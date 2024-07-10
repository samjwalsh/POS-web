import { db } from "../db";
import { gt, lt, and, eq, avg, sum } from "drizzle-orm";
import { ordersTable } from "../schema";

export const getLast30Days = async () => {

    const output: Output = [];
    let dateBegin = new Date((new Date()).setUTCHours(0, 0, 0, 0));
    let dateEnd = new Date((new Date()).setUTCHours(23, 59, 59, 999));
    const day = new Date(86400000)
    for (let day = 0; day < 30; day++) {

        const total = await db.select({ value: sum(ordersTable.subtotal) }).from(ordersTable).where(and(eq(ordersTable.deleted, false), and(gt(ordersTable.time, new Date(dateBegin)), lt(ordersTable.time, new Date(dateEnd)))));
        //subtract 24 hrs from the date
        output.push({ date: new Date(dateBegin), value: parseFloat(total[0].value ?? '0') });
        dateBegin.setDate(dateBegin.getDate() - 1);
        dateEnd.setDate(dateEnd.getDate() - 1);
    }
    return output;
}

export type Output = Array<AverageOnDay>;
type AverageOnDay = {
    date: Date,
    value: number,
}