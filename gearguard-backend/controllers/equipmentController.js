import Equipment from "../models/Equipment.js";

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
