// routes/signup/+page.server.ts
import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";
import { db } from "$lib/db/db";

import type { Actions } from "./$types";
import { usersTable } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { formSchema } from "./schema";

export const actions: Actions = {
    default: async (event) => {

        return fail(400, {
            message: 'Not accepting signups'
        })
        const formData = await event.request.formData();
        const username = formData.get("username");
        const password = formData.get("password");
        const confirm = formData.get("confirm");
        const firstName = formData.get("first-name");
        const lastName = formData.get("last-name");

        // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
        // keep in mind some database (e.g. mysql) are case insensitive

        //TODO create check to make sure username is in list of current invitations

        const data = { firstName, lastName, username, password, confirm }
        console.log(data)
        const validate = formSchema.safeParse(data);
        if (!validate.success) {
            return fail(400, {
                message: validate.error.errors[0].message
            });
        }

        if (typeof password !== "string" || typeof username !== "string" || typeof firstName !== "string" || typeof lastName !== 'string') {
            return fail(400, {
                message: "Invalid password"
            });
        }



        const userId = generateIdFromEntropySize(10); // 16 characters long
        const passwordHash = await hash(password, {
            // recommended minimum parameters
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });

        if ((await db.select().from(usersTable).where(eq(usersTable.id, userId))).length > 0) {
            return fail(400, {
                message: "User already exists"
            });
        }

        await db.insert(usersTable).values({
            id: userId,
            username,
            password_hash: passwordHash,
            firstName,
            lastName
        })

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });

        redirect(302, "/app/dash");
    }
};