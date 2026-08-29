
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from "./DB/db.js";
import route from './Routes/todoRoutes.js';
import authRoutes from './Routes/authRoutes.js';
import metricRoutes from './Routes/metricRoutes.js';
import { saveMetricSnapshot } from './Controller/metricController.js';

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/csbs', route);
app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricRoutes);

// Start server after database connection
const startServer = async () => {
   try {
      await connectDb();
      app.listen(PORT, () => {
         console.log(`Server running on http://localhost:${PORT}`);

         // Save a metric snapshot every 30 seconds
         setInterval(() => {
            saveMetricSnapshot();
         }, 30000);

         console.log('[Metrics] Snapshot scheduler started (every 30s)');
      });
   } catch (error) {
      console.error('Failed to start server:', error);
   }
}

startServer();