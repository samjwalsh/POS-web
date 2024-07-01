import mongoose from 'mongoose';
import {DB_ADDRESS, DB_PORT, DB_NAME, DB_USER, DB_PASS} from '$env/static/private'

export const connectDB = async() => {
    const uri = `mongodb://${DB_USER}:${DB_PASS}@${DB_ADDRESS}:${DB_PORT}/${DB_NAME}?authSource=admin`;
    
    await mongoose.connect(uri);
    
    const db = mongoose.connection;
    
    db.once('open', function () {
        console.log('MongoDB connection established successfully');
    });
}