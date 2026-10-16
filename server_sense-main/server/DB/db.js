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

let _dbConnected = false;

/** Returns true once MongoDB has connected successfully */
export const isDbConnected = () => _dbConnected;

const connectDb = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/serversense";
        if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
            console.warn("[DB] No MONGODB_URI found in env. Attempting local MongoDB connection at " + uri);
        }
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,  // increased from 3s → 10s for Atlas
            connectTimeoutMS: 10000,
        });
        _dbConnected = true;
        console.log("Database connected successfully");
    } catch (err) {
        _dbConnected = false;
        console.error("Database connection error:", err.message);
        console.warn("[DB] Running without persistent DB — live metrics (/api/metrics/current) remain active.");

        // Retry once after 15 seconds in case network was slow to initialize
        setTimeout(async () => {
            try {
                const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/serversense";
                await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
                _dbConnected = true;
                console.log("[DB] Reconnected to MongoDB on retry.");
            } catch (retryErr) {
                console.error("[DB] Retry also failed:", retryErr.message);
            }
        }, 15000);
    }
}

export default connectDb;