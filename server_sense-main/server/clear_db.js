import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: './server/.env' });

const uri = process.env.TELEGRAM_BOT_TOKEN ? process.env.MONGO_URI : null;

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://jaswindl:jaswindl@cluster0.prmvy7o.mongodb.net/serversense?retryWrites=true&w=majority&appName=Cluster0")
.then(async () => {
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    const result = await db.collection('agentdiagnoses').deleteMany({});
    console.log(`Deleted ${result.deletedCount} old AI diagnoses to clean up the dashboard.`);
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
