import express from "express";
import {
  getAlerts,
  resolveAlert,
  resolveAllAlerts,
  acknowledgeAlert,
  unacknowledgeAlert,
} from "../Controller/alertController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET — any authenticated user can read alerts
router.get("/", verifyToken, getAlerts);
// PATCH — admin only; enforced on backend
router.patch("/resolve-all", verifyToken, requireRole("admin"), resolveAllAlerts);
router.patch("/:id/resolve", verifyToken, requireRole("admin"), resolveAlert);
router.patch("/:id/acknowledge", verifyToken, requireRole("admin"), acknowledgeAlert);
router.patch("/:id/unacknowledge", verifyToken, requireRole("admin"), unacknowledgeAlert);

export default router;
