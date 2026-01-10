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

export const closeRequest = async (req, res) => {
  try {
    const { duration } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.duration = duration;
    request.status = "repaired";

    await request.save();
    res.json(request);
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
