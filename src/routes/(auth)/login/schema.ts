import { z } from "zod";

export const formSchema = z.object({
    username: z.string().email({message: 'Email is invalid'}),
    password: z.string(),
})

export type FormSchema = typeof formSchema;