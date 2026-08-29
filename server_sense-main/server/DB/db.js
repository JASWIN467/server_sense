//we will handle connectivity b/w express and mongodb
// const mongoose=require('mongoose') commonjs



import mongoose from "mongoose";
import dotenv from 'dotenv';
import dns from 'node:dns';

dotenv.config();

// Fix Wi-Fi DNS issues with MongoDB Atlas SRV records
try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
    console.warn("Could not set custom DNS servers:", e.message);
}

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
}

export default connectDb