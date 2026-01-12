import express from "express";
import { runAIScan } from "../controllers/aiController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Only admin can trigger AI
router.get("/scan", protect, adminOnly, runAIScan);

export default router;
