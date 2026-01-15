import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { createUserAdmin, setUserTeam, listUsersAdmin } from "../controllers/userController.js";

const router = express.Router();

// Admin: create a new user (optionally assigned to a team)
router.post("/", protect, adminOnly, createUserAdmin);

// Admin: list/search users
// Query: ?role=technician&q=riya&page=1&pageSize=20
router.get("/", protect, adminOnly, listUsersAdmin);

// Admin: move/remove user team
// Body: { teamId: "<teamId>" } OR { teamId: null }
router.put("/:id/team", protect, adminOnly, setUserTeam);

export default router;
