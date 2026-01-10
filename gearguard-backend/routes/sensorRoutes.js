import express from "express";
import protect from "../middleware/auth.js";
import { addSensorLog, getSensorLogs } from "../controllers/sensorController.js";

const router = express.Router();

router.post("/", protect, addSensorLog);
router.get("/:id", protect, getSensorLogs);

export default router;
