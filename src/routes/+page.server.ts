import type { PageServerLoad, Actions } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) redirect(302, "/login");
    else redirect(302, '/app/dash')
    return {
        username: event.locals.user.username
    };
};