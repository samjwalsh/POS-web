import type { Handle } from '@sveltejs/kit';
import { sync_key } from '$env/static/private'
import { error } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    console.log(`Request from ${event.getClientAddress()} to ${event.url.pathname}`)
    if (event.url.pathname.startsWith('/api')) {
        if (event.request.headers.get('key') !== sync_key) { console.log('Not Authenticated'); error(400, "Not Authenticated") };
        // console.log('Authenticated')
    }
    const response = await resolve(event);
    return response;
};
