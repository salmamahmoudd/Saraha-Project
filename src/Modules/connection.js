import { connect } from 'mongoose';
import { DB_URL_ATLAS } from '../../config/config.service.js';

async function connectDB() {
    try{
         await connect(DB_URL_ATLAS)
            console.log('Connected to the database');
    }catch (error) {
        console.log('Database connection error:', error);
    }
}

export default connectDB;