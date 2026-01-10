import express from "express";
import protect from "../middleware/auth.js";
import { createRequest, assignToMe, closeRequest } from "../controllers/requestController.js";
import { getKanban } from "../controllers/requestController.js";
import { getCalendar } from "../controllers/requestController.js";

const router = express.Router();

router.post("/", protect, createRequest);
router.put("/:id/assign", protect, assignToMe);
router.put("/:id/close", protect, closeRequest);
router.get("/kanban", protect, getKanban);
router.get("/calendar", protect, getCalendar);

export default router;
