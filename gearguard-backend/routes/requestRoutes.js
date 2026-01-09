import express from "express";
import protect from "../middleware/auth.js";
import { createRequest, assignToMe, closeRequest } from "../controllers/requestController.js";

const router = express.Router();

router.post("/", protect, createRequest);
router.put("/:id/assign", protect, assignToMe);
router.put("/:id/close", protect, closeRequest);

export default router;
