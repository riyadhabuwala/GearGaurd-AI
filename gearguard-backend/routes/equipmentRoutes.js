import express from "express";
import { createEquipment, getAllEquipment } from "../controllers/equipmentController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createEquipment);
router.get("/", protect, getAllEquipment);

export default router;
