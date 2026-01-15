import Team from "../models/Team.js";
import User from "../models/User.js";

export const createTeam = async (req, res) => {
  try {
    const rawName = req.body?.name;
    const name = typeof rawName === "string" ? rawName.trim() : "";
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const team = await Team.create({ name });
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { teamId, userId, email } = req.body || {};
    if (!teamId) {
      return res.status(400).json({ message: "teamId is required" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      const safeEmail = String(email).trim().toLowerCase();
      user =
        (await User.findOne({ email: safeEmail })) ||
        (await User.findOne({
          email: new RegExp(`^${safeEmail.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "i"),
        }));
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRole = String(user.role || "").toLowerCase();
    if (userRole !== "technician") {
      return res.status(400).json({ message: "Only technicians can be assigned to a team" });
    }

    // If user already belongs to another team, remove them from that team's members
    const currentTeamId = user.team ? String(user.team) : "";
    if (currentTeamId && currentTeamId !== String(team._id)) {
      await Team.updateOne(
        { _id: user.team },
        { $pull: { members: user._id } }
      );
    }

    // Add to this team without duplicates
    await Team.updateOne(
      { _id: team._id },
      { $addToSet: { members: user._id } }
    );

    user.team = team._id;
    await user.save();

    const updatedTeam = await Team.findById(team._id).select("name members").lean();
    res.json({
      message: "Member added to team",
      team: {
        ...updatedTeam,
        memberCount: Array.isArray(updatedTeam?.members) ? updatedTeam.members.length : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 }).select("name members").lean();
    res.json(
      teams.map((t) => ({
        _id: t._id,
        name: t.name,
        memberCount: Array.isArray(t.members) ? t.members.length : 0,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const { q, page, pageSize } = req.query;
    const wantsPaging =
      Object.prototype.hasOwnProperty.call(req.query, "page") ||
      Object.prototype.hasOwnProperty.call(req.query, "pageSize") ||
      Object.prototype.hasOwnProperty.call(req.query, "q");

    const team = await Team.findById(id)
      .select("name members")
      .lean();

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Source of truth for team assignment is User.team
    const baseUserFilter = { team: team._id };
    if (q) {
      const rx = new RegExp(String(q), "i");
      baseUserFilter.$or = [{ name: rx }, { email: rx }, { role: rx }];
    }

    if (!wantsPaging) {
      const members = await User.find(baseUserFilter)
        .select("name email role")
        .sort({ name: 1 })
        .lean();

      return res.json({
        _id: team._id,
        name: team.name,
        members,
        memberCount: members.length,
        total: members.length,
        page: 1,
        pageSize: members.length,
      });
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(200, Math.max(1, Number(pageSize) || 20));
    const skip = (safePage - 1) * safePageSize;

    const [members, total] = await Promise.all([
      User.find(baseUserFilter)
        .select("name email role")
        .sort({ name: 1 })
        .skip(skip)
        .limit(safePageSize)
        .lean(),
      User.countDocuments(baseUserFilter),
    ]);

    return res.json({
      _id: team._id,
      name: team.name,
      members,
      memberCount: total,
      total,
      page: safePage,
      pageSize: safePageSize,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
