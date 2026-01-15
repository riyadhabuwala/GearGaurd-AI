import express from "express";
import { createEquipment, getAllEquipment, getEquipmentRequests, updateEquipment } from "../controllers/equipmentController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, adminOnly, createEquipment);
router.get("/", protect, getAllEquipment);
router.put("/:id", protect, adminOnly, updateEquipment);
router.get("/:id/requests", protect, getEquipmentRequests);

export default router;
