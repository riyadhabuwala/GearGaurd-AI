import Request from "../models/Request.js";
import Equipment from "../models/Equipment.js";

export const createRequest = async (req, res) => {
  try {
    const { subject, type, equipment, scheduledDate } = req.body;

    const eq = await Equipment.findById(equipment).populate("assignedTeam");
    if (!eq) return res.status(404).json({ message: "Equipment not found" });

    const request = await Request.create({
      subject,
      type,
      equipment,
      team: eq.assignedTeam._id,
      scheduledDate,
      createdBy: req.user.id
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// export const assignToMe = async (req, res) => {
//   try {
//     const request = await Request.findById(req.params.id);

//     if (!request) return res.status(404).json({ message: "Request not found" });

//     if (request.status !== "new") {
//       return res.status(400).json({ message: "Already assigned" });
//     }

//     request.assignedTo = req.user.id;
//     request.status = "in-progress";

//     await request.save();
//     res.json(request);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
import User from "../models/User.js";

export const assignToMe = async (req, res) => {
  try {
    // Load request with team
    const request = await Request.findById(req.params.id).populate("team");

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    // Only new jobs can be taken
    if (request.status !== "new")
      return res.status(400).json({ message: "Already assigned" });

    // Load logged-in user
    const user = await User.findById(req.user.id);

    // Only technicians allowed
    if (user.role !== "technician")
      return res.status(403).json({ message: "Only technicians can take jobs" });

    // Must belong to same team
    if (!user.team || user.team.toString() !== request.team._id.toString())
      return res.status(403).json({ message: "You are not in this team" });

    // Assign job
    request.assignedTo = user._id;
    request.status = "in-progress";

    await request.save();
    res.json(request);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const assignToTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;

    if (!technicianId) {
      return res.status(400).json({ message: "technicianId is required" });
    }

    const request = await Request.findById(req.params.id).populate("team");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "new") {
      return res.status(400).json({ message: "Only new requests can be assigned" });
    }

    const technician = await User.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    if (technician.role !== "technician") {
      return res.status(400).json({ message: "Selected user is not a technician" });
    }

    if (!technician.team || !request.team || technician.team.toString() !== request.team._id.toString()) {
      return res.status(400).json({ message: "Technician must belong to the request team" });
    }

    request.assignedTo = technician._id;
    request.status = "in-progress";

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reassignToTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;

    if (!technicianId) {
      return res.status(400).json({ message: "technicianId is required" });
    }

    const request = await Request.findById(req.params.id).populate("team");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "in-progress") {
      return res.status(400).json({ message: "Only in-progress requests can be reassigned" });
    }

    const technician = await User.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    if (technician.role !== "technician") {
      return res.status(400).json({ message: "Selected user is not a technician" });
    }

    if (!technician.team || !request.team || technician.team.toString() !== request.team._id.toString()) {
      return res.status(400).json({ message: "Technician must belong to the request team" });
    }

    request.assignedTo = technician._id;
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const closeRequest = async (req, res) => {
  try {
    const { duration } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Permission rules:
    // - Admin can close any request
    // - Technician can only close requests assigned to them
    // - Employees cannot close requests
    if (req.user.role !== "admin") {
      if (req.user.role !== "technician") {
        return res.status(403).json({ message: "Not allowed to close requests" });
      }

      const assignedToId = request.assignedTo ? String(request.assignedTo) : "";
      if (!assignedToId || assignedToId !== String(req.user.id)) {
        return res.status(403).json({ message: "Only the assigned technician can close this request" });
      }
    }

    if (request.status !== "in-progress") {
      return res.status(400).json({ message: "Only in-progress requests can be closed" });
    }

    const durationNum = Number(duration);
    if (!Number.isFinite(durationNum) || durationNum <= 0) {
      return res.status(400).json({ message: "duration must be a positive number (hours)" });
    }

    request.duration = durationNum;
    request.status = "repaired";

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllRequestsAdmin = async (req, res) => {
  try {
    const {
      status,
      priority,
      equipment,
      equipmentId,
      team,
      assignedTo,
      type,
      q,
      page = "1",
      pageSize = "50",
    } = req.query;

    const filter = {};

    if (status) {
      const statuses = String(status)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (statuses.length) filter.status = { $in: statuses };
    }

    if (priority) {
      const priorities = String(priority)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (priorities.length) filter.priority = { $in: priorities };
    }

    if (type) filter.type = String(type);
    if (team) filter.team = String(team);
    if (assignedTo) filter.assignedTo = String(assignedTo);

    const eqId = equipmentId || equipment;
    if (eqId) filter.equipment = String(eqId);

    if (q) {
      filter.subject = { $regex: String(q), $options: "i" };
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(200, Math.max(1, Number(pageSize) || 50));
    const skip = (safePage - 1) * safePageSize;

    const [items, total] = await Promise.all([
      Request.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safePageSize)
        .populate("equipment", "name department location riskScore")
        .populate("team", "name")
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .select(
          "subject type priority status scheduledDate duration aiExplanation createdAt equipment team assignedTo createdBy"
        ),
      Request.countDocuments(filter),
    ]);

    res.json({
      items,
      page: safePage,
      pageSize: safePageSize,
      total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getKanban = async (req, res) => {
  try {
    let filter = {};

    // If technician → only show their team's requests
    if (req.user.role === "technician") {
      const user = await User.findById(req.user.id);
      filter.team = user.team;
    }

    const requests = await Request.find(filter)
      .populate("equipment")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 });

    const kanban = {
      new: [],
      "in-progress": [],
      repaired: [],
      scrap: []
    };

    requests.forEach(r => {
      kanban[r.status].push(r);
    });

    res.json(kanban);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCalendar = async (req, res) => {
  try {
    let filter = { type: "preventive" };

    // Technicians see only their team's preventive jobs
    if (req.user.role === "technician") {
      const user = await User.findById(req.user.id);
      filter.team = user.team;
    }

    const requests = await Request.find(filter)
      .populate("equipment", "name")
      .populate("assignedTo", "name");

    const calendar = {};

    requests.forEach(r => {
      const date = r.scheduledDate?.toISOString().split("T")[0];
      if (!calendar[date]) calendar[date] = [];
      calendar[date].push(r);
    });

    res.json(calendar);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
