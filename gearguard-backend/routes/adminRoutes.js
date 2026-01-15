import express from "express";
import { getAdminDashboard } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminDashboard);

export default router;
