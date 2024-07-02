// migrate.ts
import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// npx tsx -r dotenv/config ./src/lib/db/migrate.ts

const { host, port, user, password, database } = process.env;
const DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${database}`

const migrationClient = postgres(DATABASE_URL, { max: 1 });
const db: PostgresJsDatabase = drizzle(migrationClient);

const main = async () => {
  console.log("Migrating database...");
  await migrate(db, { migrationsFolder: "./src/lib/db/migrations" });
  await migrationClient.end();
  console.log("Database migrated successfully!");
};

main();