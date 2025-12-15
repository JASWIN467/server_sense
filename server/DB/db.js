//we will handle connectivity b/w express and mongodb
// const mongoose=require('mongoose') commonjs



import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config();

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