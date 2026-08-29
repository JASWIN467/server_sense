import express from "express";
import {
  getCurrentMetrics,
  getMetricHistory,
  healthCheck,
} from "../Controller/metricController.js";

const router = express.Router();

router.get("/current", getCurrentMetrics);
router.get("/history", getMetricHistory);
router.get("/health", healthCheck);

export default router;
