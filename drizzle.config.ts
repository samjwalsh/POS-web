import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
    dialect: "postgresql", // "mysql" | "sqlite" | "postgresql"
    schema: "./src/lib/db/schema.ts",
    out: "./src/lib/db/migrations",
    dbCredentials: {
        host: process.env.db_host as string,
        port: parseInt(process.env.db_port as string),
        user: process.env.db_user as string,
        password: process.env.db_password as string,
        database: process.env.db_database as string,
        ssl: 'prefer'
    }
});