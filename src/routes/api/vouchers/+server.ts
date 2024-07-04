import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/db';
import { vouchersTable } from '$lib/db/schema';
import { cF } from '$lib/utils';
import { eq, and } from 'drizzle-orm';
import {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers,
} from 'obscenity';
import suid from 'short-unique-id';
import { default as ch } from 'chalk';
import { logger } from '$lib/utils';


export const POST: RequestHandler = async ({ request }) => {
    const startTime = new Date();
    const {
        shop,
        till,
        value,
        quantity,
    } = await request.json();

    if (shop == undefined || till == undefined || value == undefined || quantity == undefined) {
        error(400, "Invalid Data")
    }

    if (quantity > 20 || value < 0) {
        error(400, "Too many vouchers")
    }

    let quantityCreated = 0;
    const createdVouchers: Array<typeof vouchersTable.$inferInsert> = [];

    while (quantityCreated < quantity) {
        const matcher = new RegExpMatcher({
            ...englishDataset.build(),
            ...englishRecommendedTransformers,
        });

        let duplicate = true;
        let obscene = true;
        let code: string = '';

        while (duplicate || obscene) {
            duplicate = false;
            obscene = false;
            code = new suid({ dictionary: 'alpha_upper', length: 5 }).rnd();
            const matchingVoucher = await db.query.vouchers.findFirst({
                where: eq(vouchersTable.code, code)
            });
            if (!matchingVoucher) duplicate = false;

            if (!matcher.hasMatch(code)) obscene = false;
        }

        // Now we have our voucher code and we can create the voucher in the DB

        const voucher: typeof vouchersTable.$inferInsert = {
            dateCreated: new Date(),
            value,
            code,
            redeemed: false,
            shopCreated: shop,
            tillCreated: till,
        };

        createdVouchers.push(voucher);
        quantityCreated++;
    }

    await db.insert(vouchersTable).values(createdVouchers)

    logger(
        shop,
        till,
        'Create Vouchers',
        Date.now() - startTime.getTime(),
        `${createdVouchers.length} @ ${ch.green(
            cF(createdVouchers[0].value)
        )}`,
        ` ${createdVouchers.map((voucher) => voucher.code).join('\n ')}`
    );

    return json(createdVouchers);
};

export const GET: RequestHandler = async ({ url }) => {
    const startTime = new Date();

    const shop = url.searchParams.get('shop');
    const till = url.searchParams.get('till');
    const code = url.searchParams.get('code')?.toUpperCase();

    if (shop == undefined || till == undefined || code == undefined) error(400, "Invalid Data")

    const matchingVoucher = await db.query.vouchers.findFirst({ where: eq(vouchersTable.code, code) });

    let outputString = '';
    if (!matchingVoucher) {
        outputString = `${code} not found`;
    } else {
        outputString = `${code} - €${matchingVoucher.value.toFixed(2)} ${matchingVoucher.redeemed ? 'Redeemed' : 'Not Redeemed'
            }`;
    }

    logger(shop, till, 'Check Voucher', Date.now() - startTime.getTime(), ``, outputString);

    if (matchingVoucher) {
        return json({ exists: true, voucher: matchingVoucher });
    }
    else
        return json({ exists: false });
};

export const PATCH: RequestHandler = async ({ request }) => {
    const startTime = new Date();
    const body = await request.json();
    const {
        shop,
        till,
    } = body
    const code = (body.code as string).toUpperCase();

    let matchingVoucher = (await db.select().from(vouchersTable).where(eq(vouchersTable.code, code)))[0];

    if (!matchingVoucher) {
        logger(shop, till, 'Redeem Voucher', Date.now() - startTime.getTime(), ``, `${code} not found`);
        return json({ success: false });
    }

    if (matchingVoucher.redeemed) {
        logger(shop, till, 'Redeem Voucher', Date.now() - startTime.getTime(), ``, `${code} already redeemed`);
        return json({ success: false, dateRedeemed: matchingVoucher.dateRedeemed });
    }

    matchingVoucher = (await db.update(vouchersTable).set({
        redeemed: true,
        dateRedeemed: new Date(),
        shopRedeemed: shop,
        tillRedeemed: till,
    }).where(and(eq(vouchersTable.code, code), eq(vouchersTable.redeemed, false))).returning())[0];

    logger(shop, till, 'Redeem Voucher', Date.now() - startTime.getTime(), ``, `${code} - €${matchingVoucher.value.toFixed(2)}`);

    return json({ success: true, value: matchingVoucher.value });

}