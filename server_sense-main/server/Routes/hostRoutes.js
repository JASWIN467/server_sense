import express from 'express';
import { getHostInfo, getTelemetryStatus } from '../Controller/hostController.js';

const router = express.Router();

// GET /api/host/info   — OS, network interfaces, system hardware
router.get('/info', getHostInfo);

// GET /api/host/telemetry — real telemetry/snapshot status from MongoDB + daemon
router.get('/telemetry', getTelemetryStatus);

export default router;
