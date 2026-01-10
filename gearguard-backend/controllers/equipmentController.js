import Equipment from "../models/Equipment.js";
import Request from "../models/Request.js";

export const createEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);
    res.status(201).json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllEquipment = async (req, res) => {
  try {
    const data = await Equipment.find().populate("assignedTeam");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEquipmentRequests = async (req, res) => {
  try {
    const equipmentId = req.params.id;

    const requests = await Request.find({ equipment: equipmentId })
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 });

    const openCount = await Request.countDocuments({
      equipment: equipmentId,
      status: { $in: ["new", "in-progress"] }
    });

    res.json({
      openCount,
      requests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};