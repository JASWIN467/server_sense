import express from "express";
import { getRules, createRule, updateRule, deleteRule, getLogs } from "../Controller/ruleController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, requireRole("admin"), getRules);
router.post("/", verifyToken, requireRole("admin"), createRule);
router.put("/:id", verifyToken, requireRole("admin"), updateRule);
router.delete("/:id", verifyToken, requireRole("admin"), deleteRule);

router.get("/logs", verifyToken, requireRole("admin"), getLogs);

export default router;
