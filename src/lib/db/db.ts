import mongoose from 'mongoose';
import { DB_ADDRESS, DB_PORT, DB_NAME, DB_USER, DB_PASS } from '$env/static/private'


import pkg from 'pg';
const { Client } = pkg;
import { host, port, user, password, database } from '$env/static/private'
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from './schema';



export const connectDB = async () => {
    const uri = `mongodb://${DB_USER}:${DB_PASS}@${DB_ADDRESS}:${DB_PORT}/${DB_NAME}?authSource=admin`;

    await mongoose.connect(uri);

    const mongoDb = mongoose.connection;

    mongoDb.once('open', function () {
        console.log('MongoDB connection established successfully');
    });


    // drizzle

    // const db = drizzle(client);
}
const client = new Client({
    host,
    port: parseInt(port),
    user,
    password,
    database,
});
await client.connect();
export const db = drizzle(client, {schema});

