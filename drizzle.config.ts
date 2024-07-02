import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
    dialect: "postgresql", // "mysql" | "sqlite" | "postgresql"
    schema: "./src/lib/db/schema.ts",
    out: "./src/lib/db/migrations",
    dbCredentials: {
        host: process.env.host as string,
        port: parseInt(process.env.port as string),
        user: process.env.user as string,
        password: process.env.password as string,
        database: process.env.database as string,
        ssl: 'prefer'
    }
});