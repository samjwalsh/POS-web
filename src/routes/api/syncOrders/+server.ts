import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/db';
import { items, orders } from '$lib/db/schema';
import { cF } from '$lib/utils';
import { eq, and, inArray } from 'drizzle-orm';
import { default as ch } from 'chalk';
import { logger } from '$lib/utils';


export const PATCH: RequestHandler = async ({ request }) => {
    console.log('req in')
    const startTime = new Date();
    // const timer = new Timer();
    // timer.time('Request Started');

    const { shop, till, allClientOrders } = await request.json();

    if (shop == undefined || till == undefined || !Array.isArray(allClientOrders)) {
        error(400, "Invalid Data")
    }

    let x = 0;

    let clientOrders: Array<ClientOrder> = []
    const dbOrders = await db.select().from(orders).where(and(eq(orders.shop, shop), eq(orders.eod, false))).innerJoin(items, eq(orders.id, items.orderId))

    const ordersToAddInDB: Array<ClientOrder> = [];
    const orderIdsToDeleteInDb: Array<string> = [];
    const orderIdsToEodInDb: Array<string> = [];

    const ordersToAddInClient: Array<ClientOrder> = [];
    const orderIdsToDeleteInClient: Array<string> = [];
    let orderIdsToEodFullyInClient: Array<string> = []

    // timer.time('Initialised Variables (DB Access)');

    // Populate array of valid client orders
    let clientOrderIndex = 0;
    let clientOrdersLength = allClientOrders.length;
    while (clientOrderIndex < clientOrdersLength) {
        const clientOrder = allClientOrders[clientOrderIndex];
        clientOrderIndex++;

        if (clientOrder.shop !== shop) continue;
        clientOrders.push(clientOrder);
        if (!clientOrder.deleted) x += clientOrder.subtotal;
    }

    // Now eod and remove any orders in the client which are eoded on the server
    if (clientOrders.length !== 0) {
    const clientOrderIDs = clientOrders.map(clientOrder => clientOrder.id);
    const ordersToEodInClient = await db.select().from(orders).where(and(inArray(orders.id, clientOrderIDs), eq(orders.eod, true)))
    orderIdsToEodFullyInClient = ordersToEodInClient.map(order => order.id)
    clientOrders = clientOrders.filter(order => !orderIdsToEodFullyInClient.includes(order.id))
    }
    // timer.time('Created array of client orders');


    const clientSorted: Array<ClientOrder> = insertionSortC(clientOrders);
    // timer.time('Sorted client orders');
    console.log(dbOrders)
    const dbSorted = insertionSort(dbOrders);
    // timer.time('Sorted DB orders');

    let clientIndex = 0;
    clientOrdersLength = clientSorted.length;
    let dbIndex = 0;
    const dbOrdersLength = dbSorted.length;
    while (true) {
        let comparison;
        let clientOrder;
        let dbOrder;

        const endOfDB = dbIndex === dbOrdersLength;
        const endOfClient = clientIndex === clientOrdersLength;
        if (endOfClient && endOfDB) break;
        if (endOfClient) {
            // DB has more orders to give to client
            dbOrder = dbSorted[dbIndex];
            comparison = -1;
        } else if (endOfDB) {
            // Client has more orders to give to DB
            clientOrder = clientSorted[clientIndex];
            comparison = 1;
        } else {
            clientOrder = clientSorted[clientIndex];
            dbOrder = dbSorted[dbIndex];
            comparison = compare(clientOrder, dbOrder);
        }

        if (comparison === 1 && clientOrder !== undefined) {
            // console.log('DB missing order');
            // Here the client order is older than the db order, so it must mean that the db is missing this order?
            ordersToAddInDB.push(clientOrder);
            clientIndex++;
        } else if (comparison === -1 && dbOrder !== undefined) {
            // console.log('Client missing order');
            // Here the db order is older than the client order, so it must mean that the client is missing this order?
            //TODO
            // Must convert db order to clientOrder type by grabbing its items
            if (!dbOrder.eod) ordersToAddInClient.push(dbOrder);
            dbIndex++;
        } else if (clientOrder !== undefined && dbOrder !== undefined) {
            // Here the orders are matching, but it means we have to do our standard checks for deletions or EODs
            // console.log('Orders Match')
            if (clientOrder.deleted && !dbOrder.deleted)
                orderIdsToDeleteInDb.push(dbOrder.id);
            else if (!clientOrder.deleted && dbOrder.deleted)
                orderIdsToDeleteInClient.push(clientOrder.id);

            if (clientOrder.eod && !dbOrder.eod) orderIdsToEodInDb.push(dbOrder.id);

            if (clientIndex < clientOrdersLength) clientIndex++;
            if (dbIndex < dbOrdersLength) dbIndex++;
        }
    }

    if (ordersToAddInDB.length !== 0) {
        try {
            // We have to split each order in to its order component and then the item components
            const { dbOrders, dbItems } = convertToDbOrdersAndItems(ordersToAddInDB)

            // Now we have both our arrays to add to the db
            await db.insert(orders).values(dbOrders);
            await db.insert(items).values(dbItems);
        } catch (e) {
            console.log(e)
        }
    }

    if (orderIdsToDeleteInDb.length !== 0) {
        try {
            await db.update(orders).set({ deleted: true }).where(inArray(orders.id, orderIdsToDeleteInDb))
        } catch (e) {
            console.log(e)
        }
    }

    if (orderIdsToEodInDb.length !== 0) {
        try {
            await db.update(orders).set({ eod: true }).where(inArray(orders.id, orderIdsToEodInDb))
        } catch (e) {
            console.log(e)
        }
    }

    const totalUpdates =
        ordersToAddInDB.length +
        orderIdsToDeleteInDb.length +
        orderIdsToEodInDb.length +
        ordersToAddInClient.length +
        orderIdsToDeleteInClient.length +
        orderIdsToEodFullyInClient.length | 0;

    const addDB =
        ordersToAddInDB.length > 0
            ? ch.green.bold(ordersToAddInDB.length)
            : ch.dim(0);
    const delDB =
        orderIdsToDeleteInDb.length > 0
            ? ch.red.bold(orderIdsToDeleteInDb.length)
            : ch.dim(0);
    const eodDB =
        orderIdsToEodInDb.length > 0
            ? ch.yellow.bold(orderIdsToEodInDb.length)
            : ch.dim(0);
    const addCl =
        ordersToAddInClient.length > 0
            ? ch.green.bold(ordersToAddInClient.length)
            : ch.dim(0);
    const delCl =
        orderIdsToDeleteInClient.length > 0
            ? ch.red.bold(orderIdsToDeleteInClient.length)
            : ch.dim(0);
    const eodCl =
        orderIdsToEodFullyInClient.length > 0
            ? ch.yellow.bold(orderIdsToEodFullyInClient.length)
            : ch.dim(0);

    const quantityOrders: number = allClientOrders.length;
    const xStr = `${ch.green(cF(x))}`;

    logger(
        shop,
        till,
        'Sync',
        Date.now() - startTime.getTime(),
        `[${quantityOrders}] ${xStr}`,
        totalUpdates > 0
            ? ` S|${addDB} ${delDB} ${eodDB}\n C|${addCl} ${delCl} ${eodCl}`
            : ''
    );

    return json({
        missingOrders: ordersToAddInClient,
        deletedOrderIds: orderIdsToDeleteInClient,
        completedEodIds: orderIdsToEodFullyInClient,
        ordersMissingInDb: ordersToAddInDB.length,
        ordersDeletedInDb: orderIdsToDeleteInDb.length,
        eodsCompletedInDb: orderIdsToEodInDb.length,
    });
};

const compare = (order1: typeof orders.$inferInsert, order2: typeof orders.$inferInsert) => {
    if (order1.id === order2.id) return 0;
    if (order1.id < order2.id) return 1;
    else return -1;
};

const insertionSort = (inputArr: Array<typeof orders.$inferInsert | ClientOrder>) => {
    for (let i = 1; i < inputArr.length; i++) {
        const key = inputArr[i];
        const id = key.id;
        let j = i - 1;
        while (j >= 0 && inputArr[j].id > id) {
            inputArr[j + 1] = inputArr[j];
            j = j - 1;
        }
        inputArr[j + 1] = key;
    }
    return inputArr;
};

const insertionSortC = (inputArr: Array<ClientOrder>) => {
    for (let i = 1; i < inputArr.length; i++) {
        const key = inputArr[i];
        const id = key.id;
        let j = i - 1;
        while (j >= 0 && inputArr[j].id > id) {
            inputArr[j + 1] = inputArr[j];
            j = j - 1;
        }
        inputArr[j + 1] = key;
    }
    return inputArr;
};

type ClientOrder = {
    id: string,
    time: Date,
    shop: string,
    till: number,
    deleted: boolean,
    eod: boolean,
    subtotal: number,
    paymentMethod: 'Card' | 'Cash',
    items: Array<ClientItem>
}

type ClientItem = {
    name: string,
    price: number,
    quantity: number,
    addons: Array<string>
}

const convertToDbOrdersAndItems: (clientOrders: Array<ClientOrder>) => OrderAndItems = (clientOrders) => {
    const output: OrderAndItems = { dbOrders: [], dbItems: [] }
    const ordersLength = clientOrders.length;
    let orderIndex = 0;
    while (orderIndex < ordersLength) {
        const order: ClientOrder = clientOrders
        [orderIndex];
        orderIndex++;

        const dbOrder: typeof orders.$inferInsert = {
            id: order.id,
            time: new Date(order.time),
            shop: order.shop,
            till: order.till,
            deleted: order.deleted,
            eod: order.eod,
            subtotal: order.subtotal,
            paymentMethod: order.paymentMethod
        }

        output.dbOrders.push(dbOrder)

        // Now we get the items to add in

        const itemsLength = order.items.length;
        let itemsIndex = 0;
        while (itemsIndex < itemsLength) {
            const item: ClientItem = order.items[itemsIndex];
            itemsIndex++;

            const dbItem: typeof items.$inferInsert = {
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                addons: item.addons,
                orderId: order.id
            }

            output.dbItems.push(dbItem)
        }
    }
    return output;
}

type OrderAndItems = {
    dbOrders: Array<typeof orders.$inferInsert>,
    dbItems: Array<typeof items.$inferInsert>
}