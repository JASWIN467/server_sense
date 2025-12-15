
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from "./DB/db.js";
import route from './Routes/todoRoutes.js';

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/csbs', route);

// Start server after database connection
const startServer = async () => {
   try {
      await connectDb();
      app.listen(PORT, () => {
         console.log(`Server running on http://localhost:${PORT}`);
      });
   } catch (error) {
      console.error('Failed to start server:', error);
   }
}

startServer();