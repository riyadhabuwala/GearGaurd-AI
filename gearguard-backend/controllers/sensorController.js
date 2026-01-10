import SensorLog from "../models/SensorLog.js";

export const addSensorLog = async (req, res) => {
  try {
    const log = await SensorLog.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getSensorLogs = async (req, res) => {
  try {
    const logs = await SensorLog.find({ equipment: req.params.id })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
