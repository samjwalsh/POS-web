// routes/login/+page.server.ts
import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { verify } from "@node-rs/argon2";
import { db } from "$lib/db/db";
import { usersTable } from "$lib/db/schema";
import { eq } from "drizzle-orm";


import { formSchema } from "./schema";

import type { Actions } from "./$types";

export const actions: Actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const username = formData.get("username");
        const password = formData.get("password");
        const data = { username, password }

        const validate = formSchema.safeParse(data);
        if (!validate.success) {
            return fail(400, {
                message: validate.error.errors[0].message
            });
        }

        if (typeof password !== "string" || typeof username !== "string") {
            return fail(400, {
                message: "Invalid password"
            });
        }

        const existingUser = (await db.select().from(usersTable).where(eq(usersTable.username, username.toLowerCase())))[0]
        if (!existingUser) {
            // NOTE:
            // Returning immediately allows malicious actors to figure out valid usernames from response times,
            // allowing them to only focus on guessing passwords in brute-force attacks.
            // As a preventive measure, you may want to hash passwords even for invalid usernames.
            // However, valid usernames can be already be revealed with the signup page among other methods.
            // It will also be much more resource intensive.
            // Since protecting against this is non-trivial,
            // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
            // If usernames are public, you may outright tell the user that the username is invalid.
            return fail(400, {
                message: "Incorrect username or password"
            });
        }

        const validPassword = await verify(existingUser.password_hash, password);
        if (!validPassword) {
            return fail(400, {
                message: "Incorrect username or password"
            });
        }

        const session = await lucia.createSession(existingUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });

        redirect(302, "/app/dash");
    }
};