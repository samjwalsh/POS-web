import pkg from 'pg';
const { Client } = pkg;
import { db_host as host, db_port as port, db_user as user, db_password as password, db_database as database } from '$env/static/private'
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from './schema';

const client = new Client({
    host,
    port: parseInt(port),
    user,
    password,
    database,
});
await client.connect();
export const db = drizzle(client, {schema});

