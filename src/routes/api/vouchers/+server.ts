import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/db';
import { vouchers } from '$lib/db/schema';
import { cF } from '$lib/utils';
import { eq } from 'drizzle-orm';
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
        key,
    } = await request.json();

    if (shop == undefined || till == undefined || value == undefined || quantity == undefined || key == undefined) {
        error(400, "Invalid Data")
    }

    if (quantity > 20 || value < 0) {
        error(400, "Too many vouchers")
    }

    let quantityCreated = 0;
    const createdVouchers: Array<typeof vouchers.$inferInsert> = [];

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
                where: eq(vouchers.code, code)
            });
            if (!matchingVoucher) duplicate = false;

            if (!matcher.hasMatch(code)) obscene = false;
        }

        // Now we have our voucher code and we can create the voucher in the DB

        const voucher: typeof vouchers.$inferInsert = {
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

    await db.insert(vouchers).values(createdVouchers)

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

export const GET: RequestHandler = async ({ request, url }) => {
    
    const startTime = new Date();
    
    // console.log(params)
    const shop = url.searchParams.get('shop');
    const till = url.searchParams.get('till');
    const key = url.searchParams.get('key');
    const code = url.searchParams.get('code')?.toUpperCase();

    const matchingVoucher = await db.query.vouchers.findFirst({ where: eq(vouchers.code, code) });

    let outputString = '';
    if (!matchingVoucher) {
        outputString = `${code} not found`;
    } else {
        outputString = `${code} - €${matchingVoucher.value.toFixed(2)} ${matchingVoucher.redeemed ? 'Redeemed' : 'Not Redeemed'
            }`;
    }

    logger(shop, till, 'Check Voucher', Date.now() - startTime.getTime(), ``, outputString);

    if (matchingVoucher) {
        return json({exists: true, voucher: matchingVoucher });
    }
    else
        return json({exists: false });


};

// export const GET: RequestHandler = async ({ request }) => {
//     const startTime = new Date();

//     console.log(request.bodyUsed)
//     // request.headers
//     const {
//         shop,
//         till,
//         value,
//         quantity,
//         key,
//     } = request.headers;

    
//     return json({});
// };