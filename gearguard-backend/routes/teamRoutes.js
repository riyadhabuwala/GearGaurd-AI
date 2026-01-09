import express from "express";
import { createTeam, addMember } from "../controllers/teamController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createTeam);
router.post("/add-member", protect, addMember);

export default router;
