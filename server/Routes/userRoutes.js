import express from "express";
import { getUsers, updateUser, deleteUser } from "../Controller/userController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Allow authenticated admins to view, edit, and delete users
router.get("/", verifyToken, requireRole("admin"), getUsers);
router.put("/:id", verifyToken, requireRole("admin"), updateUser);
router.delete("/:id", verifyToken, requireRole("admin"), deleteUser);

export default router;
