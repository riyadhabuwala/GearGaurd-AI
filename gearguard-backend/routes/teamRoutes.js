import express from "express";
import { createTeam, addMember, listTeams, getTeamById } from "../controllers/teamController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, adminOnly, createTeam);
router.post("/add-member", protect, adminOnly, addMember);
router.get("/", protect, adminOnly, listTeams);
router.get("/:id", protect, adminOnly, getTeamById);

export default router;
