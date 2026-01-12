import express from "express";
import { createEquipment, getAllEquipment, getEquipmentRequests } from "../controllers/equipmentController.js";
import {protect} from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createEquipment);
router.get("/", protect, getAllEquipment);
router.get("/:id/requests", protect, getEquipmentRequests);

export default router;
