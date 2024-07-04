import pkg from 'pg';
const { Client } = pkg;
import { host, port, user, password, database } from '$env/static/private'
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

