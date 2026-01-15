import Equipment from "../models/Equipment.js";
import Request from "../models/Request.js";

const ALLOWED_UPDATE_FIELDS = [
  "name",
  "serialNumber",
  "department",
  "location",
  "assignedTeam",
  "purchaseDate",
  "warrantyTill",
  "status",
  "riskScore",
];

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
    const { status, team, q } = req.query;

    const filter = {};
    if (status) filter.status = String(status);
    if (team) filter.assignedTeam = String(team);
    if (q) {
      filter.$or = [
        { name: { $regex: String(q), $options: "i" } },
        { serialNumber: { $regex: String(q), $options: "i" } },
        { department: { $regex: String(q), $options: "i" } },
        { location: { $regex: String(q), $options: "i" } },
      ];
    }

    const data = await Equipment.find(filter)
      .sort({ updatedAt: -1 })
      .populate("assignedTeam", "name");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const updates = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    const updated = await Equipment.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("assignedTeam", "name");

    if (!updated) return res.status(404).json({ message: "Equipment not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getEquipmentRequests = async (req, res) => {
  try {
    const equipmentId = req.params.id;

    const { page = "1", pageSize = "20" } = req.query;
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(200, Math.max(1, Number(pageSize) || 20));
    const skip = (safePage - 1) * safePageSize;

    const [items, total, openCount] = await Promise.all([
      Request.find({ equipment: equipmentId })
        .populate("assignedTo", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safePageSize),
      Request.countDocuments({ equipment: equipmentId }),
      Request.countDocuments({
        equipment: equipmentId,
        status: { $in: ["new", "in-progress"] },
      }),
    ]);

    res.json({
      openCount,
      items,
      // Backward compatibility for existing frontend
      requests: items,
      page: safePage,
      pageSize: safePageSize,
      total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};