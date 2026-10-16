
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from "./DB/db.js";
import route from './Routes/todoRoutes.js';
import authRoutes from './Routes/authRoutes.js';
import metricRoutes from './Routes/metricRoutes.js';
import alertRoutes from './Routes/alertRoutes.js';
import thresholdRoutes from './Routes/thresholdRoutes.js';
import hostRoutes from './Routes/hostRoutes.js';
import ruleRoutes from './Routes/ruleRoutes.js';
import aiDiagnosisRoutes from './Routes/aiDiagnosisRoutes.js';
import integrationRoutes from './Routes/integrationRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import { saveMetricSnapshot } from './Controller/metricController.js';
import { seedAdmin } from './Controller/authController.js';

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express();

app.use(cors());
app.use(express.json());

// Root health check endpoint
app.get('/', (req, res) => {
   res.json({ status: 'ok', service: 'ServerSense API', timestamp: new Date().toISOString() });
});

// Routes
app.use('/csbs', route);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/thresholds', thresholdRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/diagnoses', aiDiagnosisRoutes);
app.use('/api/integrations', integrationRoutes);

// Start server immediately so API is responsive, then connect DB
const startServer = async () => {
   try {
      app.listen(PORT, () => {
         console.log(`Server running on http://localhost:${PORT}`);

         // Save a metric snapshot every 5 minutes
         setInterval(() => {
            saveMetricSnapshot();
         }, 300000);

         console.log('[Metrics] Snapshot scheduler started (every 5m)');
      });

      // Connect to MongoDB in background
      await connectDb();
      // Seed default admin user if not exists
      await seedAdmin();
   } catch (error) {
      console.error('Failed to start server:', error);
   }
}

startServer();