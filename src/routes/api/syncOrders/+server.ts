import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/db';
import { itemsTable, ordersTable } from '$lib/db/schema';
import { cF, Timer } from '$lib/utils';
import { eq, and, inArray, gt } from 'drizzle-orm';
import { default as ch } from 'chalk';
import { logger } from '$lib/utils';


export const PATCH: RequestHandler = async ({ request }) => {
    const startTime = new Date();
    const timer = new Timer();
    timer.time('Request started');

    const { shop, till, allClientOrders } = await request.json();

    timer.time('Collected client orders')

    await db.update(ordersTable).set({ eod: false }).where(gt(ordersTable.time, new Date('2024-05-01')))

    if (shop == undefined || till == undefined || !Array.isArray(allClientOrders)) {
        error(400, "Invalid Data")
    }

    let x = 0;

    let clientOrders: Array<ClientOrder> = []
    const dbOrders = await db.select().from(ordersTable).where(and(eq(ordersTable.shop, shop), eq(ordersTable.eod, false)))
    console.log(dbOrders.length);
    console.log(dbOrders[0])

    const ordersToAddInDB: Array<ClientOrder> = [];
    const orderIdsToDeleteInDb: Array<string> = [];
    const orderIdsToEodInDb: Array<string> = [];

    const orderIdsToAddInClient: Array<string> = [];

    const ordersToAddInClient: Array<ClientOrder> = [];
    const orderIdsToDeleteInClient: Array<string> = [];
    let orderIdsToEodFullyInClient: Array<string> = []

    timer.time('Initialised variables (DB access)');

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

    timer.time('Created array of client orders')




    const clientSorted: Array<ClientOrder> = insertionSortC(clientOrders);
    timer.time('Sorted client orders');

    // Now eod and remove any orders in the client which are eoded on the server
    if (clientOrders.length !== 0) {
        const clientOrderIDs = clientOrders.map(clientOrder => clientOrder.id);
        const ordersToEodInClient = await db.select({ id: ordersTable.id }).from(ordersTable).where(inArray(ordersTable.id, clientOrderIDs));
        console.log(ordersToEodInClient)
        orderIdsToEodFullyInClient = ordersToEodInClient.map(order => order.id)
        clientOrders = clientOrders.filter(order => !orderIdsToEodFullyInClient.includes(order.id))

        timer.time('Check for orders to EOD in client');
    }

    const dbSorted = insertionSort(dbOrders);
    timer.time('Sorted DB orders');

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

            dbIndex++;
            orderIdsToAddInClient.push(dbOrder.id);

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

    timer.time('Compared orders');

    if (orderIdsToAddInClient.length !== 0) {
        const dbOrdersAndItems = await db.query.ordersTable.findMany({ with: { items: true }, where: inArray(ordersTable.id, orderIdsToAddInClient) })

        ordersToAddInClient.push(...dbOrdersAndItems);
        timer.time('Adding orders missing from client (DB Access)')
    }

    if (ordersToAddInDB.length !== 0) {
        try {
            // We have to split each order in to its order component and then the item components
            const { orders: dbOrders, items: dbItems } = clientOrderToDbOrderAndItems(ordersToAddInDB)

            // Now we have both our arrays to add to the db
            await db.insert(ordersTable).values(dbOrders).onConflictDoNothing();
            if (dbItems)
                await db.insert(itemsTable).values(dbItems).onConflictDoNothing();


        } catch (e) {
            console.log(e)
        }

        timer.time('Added orders missing in DB (DB Access)');

    }

    if (orderIdsToDeleteInDb.length !== 0) {
        try {
            await db.update(ordersTable).set({ deleted: true }).where(inArray(ordersTable.id, orderIdsToDeleteInDb))
        } catch (e) {
            console.log(e)
        }

        timer.time('Marked orders in DB as deleted (DB Access)');

    }

    if (orderIdsToEodInDb.length !== 0) {
        try {
            await db.update(ordersTable).set({ eod: true }).where(inArray(ordersTable.id, orderIdsToEodInDb));
            orderIdsToEodFullyInClient.push(...orderIdsToEodInDb);
        } catch (e) {
            console.log(e)
        }
        timer.time('Marked orders in DB as EOD (DB Access)');

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

const compare = (order1: typeof ordersTable.$inferInsert, order2: typeof ordersTable.$inferInsert) => {
    if (order1.id === order2.id) return 0;
    if (order1.id < order2.id) return 1;
    else return -1;
};

const insertionSort = (inputArr: Array<typeof ordersTable.$inferInsert | ClientOrder>) => {
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

const dbOrderAndItemsToClientOrder: (orderAndItems: OrderAndItems) => ClientOrder = (orderAndItems) => {
    const { id, time, shop, till, deleted, eod, subtotal, paymentMethod } = orderAndItems.orders[0];
    const dbItems = orderAndItems.items === null ? [] : orderAndItems.items;
    const clientItems: Array<ClientItem> = dbItems.map(({ name, price, quantity, addons }) => { return { name, price, quantity, addons: addons ? addons : [] } });
    const order: ClientOrder = {
        id,
        time,
        shop,
        till,
        deleted,
        eod,
        subtotal,
        paymentMethod,
        items: clientItems
    }
    return order;
}

const clientOrderToDbOrderAndItems: (clientOrders: Array<ClientOrder>) => OrderAndItems = (clientOrders) => {
    const output: OrderAndItems = { orders: [], items: [] }
    const ordersLength = clientOrders.length;
    let orderIndex = 0;
    while (orderIndex < ordersLength) {
        const order: ClientOrder = clientOrders
        [orderIndex];
        orderIndex++;

        const dbOrder: typeof ordersTable.$inferInsert = {
            id: order.id,
            time: new Date(order.time),
            shop: order.shop,
            till: order.till,
            deleted: order.deleted,
            eod: order.eod,
            subtotal: order.subtotal,
            paymentMethod: order.paymentMethod,
            rba: order.items[0].name === "Reconcilliation Balance Adjustment" ? true : false
        }

        output.orders.push(dbOrder)

        // Now we get the items to add in

        const itemsLength = order.items.length;
        let itemsIndex = 0;
        while (itemsIndex < itemsLength) {
            const item: ClientItem = order.items[itemsIndex];
            itemsIndex++;

            const dbItem: typeof itemsTable.$inferInsert = {
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                addons: item.addons ? item.addons : [],
                orderId: order.id
            }
            if (Array.isArray(output.items))
                output.items.push(dbItem)
        }
    }
    return output;
}

type OrderAndItems = {
    orders: Array<typeof ordersTable.$inferInsert>,
    items: Array<typeof itemsTable.$inferInsert> | null
}