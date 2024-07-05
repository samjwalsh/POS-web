import type { RequestHandler } from './$types';
import { db } from '$lib/db/db';
import { logsTable } from '$lib/db/schema';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    const { source, note, objs, message } = await request.json();

    const log: typeof logsTable.$inferInsert = {
        source,
        note,
        json: JSON.stringify(objs),
        message,
        time: new Date()
    }
    try {
        await db.insert(logsTable).values(log);
    } catch (e) {
        console.log(e)
        return json({ success: false })
    }

    return json({ success: true })
}