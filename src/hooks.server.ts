import type { Handle } from '@sveltejs/kit';
import { sync_key } from '$env/static/private'
import { error, redirect } from '@sveltejs/kit';
import { lucia } from "$lib/server/auth";

export const handle: Handle = async ({ event, resolve }) => {
    console.log(`Request from ${event.request.headers.get("x-forwarded-for") || event.getClientAddress()
        } to ${event.url.pathname}`)
    if (event.url.pathname.startsWith('/api')) {
        if (event.request.headers.get('key') !== sync_key) { console.log('Not Authenticated'); error(400, "Not Authenticated") };
        return resolve(event)
    }


    const sessionId = event.cookies.get(lucia.sessionCookieName);
    if (!sessionId) {
        return resolve(event);
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });
    }
    if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });
    }
    event.locals.user = user ?? event.locals.user;
    event.locals.session = session ?? event.locals.session;

    return resolve(event);
};
