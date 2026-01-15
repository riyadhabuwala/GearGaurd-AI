import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
	getAllRequestsAdmin,
	createRequest,
	assignToMe,
	assignToTechnician,
	reassignToTechnician,
	closeRequest,
	getKanban,
	getCalendar,
} from "../controllers/requestController.js";

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/", protect, adminOnly, getAllRequestsAdmin);
router.put("/:id/assign", protect, assignToMe);
router.put("/:id/assign-to", protect, adminOnly, assignToTechnician);
router.put("/:id/reassign", protect, adminOnly, reassignToTechnician);
router.put("/:id/close", protect, closeRequest);
router.get("/kanban", protect, getKanban);
router.get("/calendar", protect, getCalendar);

export default router;
