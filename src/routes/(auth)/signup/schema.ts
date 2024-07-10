import { z } from "zod";

export const formSchema = z.object({
    firstName: z.string().min(2, { message: "First name must be greater than 1 character" }),
    lastName: z.string().min(2, { message: "Last name must be greater than 1 character" }),
    username: z.string().email().max(128),
    password: z.string().min(8, { message: "Password must be 8 characters or longer" }).max(128),
    confirm: z.string()
}).refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"], // path of error
});

export type FormSchema = typeof formSchema;