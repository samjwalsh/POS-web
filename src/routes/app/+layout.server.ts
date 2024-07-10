import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
    if (!event.locals.user) {
        console.log('not signed in')
        return redirect(302, "/login");
    }
    return {
        user: event.locals.user
    };
};