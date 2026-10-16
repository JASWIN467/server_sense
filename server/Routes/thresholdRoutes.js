import express from "express";
import {
  getThresholds,
  updateThresholds,
} from "../Controller/thresholdController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET — any authenticated user can read thresholds
router.get("/", verifyToken, getThresholds);
// PUT — admin only; enforced on backend
router.put("/", verifyToken, requireRole("admin"), updateThresholds);

export default router;
