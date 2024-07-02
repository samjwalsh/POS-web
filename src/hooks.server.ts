import { connectDB } from "$lib/db/db";
console.log('DB Connected')
await connectDB();
console.log('Ready')

