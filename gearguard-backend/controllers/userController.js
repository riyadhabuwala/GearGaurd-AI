import Team from "../models/Team.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

function generateTempPassword(length = 12) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export const createUserAdmin = async (req, res) => {
  try {
    const { name, email, role, password, teamId } = req.body || {};

    const safeName = typeof name === "string" ? name.trim() : "";
    const safeEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const safeRole = typeof role === "string" ? role.trim().toLowerCase() : "employee";

    if (!safeName) return res.status(400).json({ message: "name is required" });
    if (!safeEmail) return res.status(400).json({ message: "email is required" });
    if (!safeRole) return res.status(400).json({ message: "role is required" });

    const allowedRoles = ["employee", "technician", "admin"];
    if (!allowedRoles.includes(safeRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email: safeEmail });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const rawPassword = typeof password === "string" && password.length ? password : generateTempPassword();
    const hashed = await bcrypt.hash(rawPassword, 10);

    let team = null;
    if (teamId) {
      if (safeRole !== "technician") {
        return res.status(400).json({ message: "Only technicians can be assigned to a team" });
      }
      team = await Team.findById(teamId);
      if (!team) return res.status(404).json({ message: "Team not found" });
    }

    const user = await User.create({
      name: safeName,
      email: safeEmail,
      password: hashed,
      role: safeRole,
      team: team ? team._id : null,
    });

    if (team) {
      await Team.updateOne({ _id: team._id }, { $addToSet: { members: user._id } });
    }

    const created = await User.findById(user._id)
      .select("name email role team")
      .populate("team", "name")
      .lean();

    res.status(201).json({
      message: "User created",
      user: created,
      // Only returned when admin didn't supply a password
      tempPassword: typeof password === "string" && password.length ? undefined : rawPassword,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const setUserTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamId } = req.body || {};

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const prevTeamId = user.team ? String(user.team) : "";

    // null/empty -> remove from team
    if (!teamId) {
      if (prevTeamId) {
        await Team.updateOne(
          { _id: user.team },
          { $pull: { members: user._id } }
        );
      }

      user.team = null;
      await user.save();

      const updated = await User.findById(user._id)
        .select("name email role team")
        .populate("team", "name")
        .lean();

      return res.json({ message: "User removed from team", user: updated });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const userRole = String(user.role || "").toLowerCase();
    if (userRole !== "technician") {
      return res.status(400).json({ message: "Only technicians can be assigned to a team" });
    }

    // Move: pull from previous team and add to new team
    if (prevTeamId && prevTeamId !== String(team._id)) {
      await Team.updateOne(
        { _id: user.team },
        { $pull: { members: user._id } }
      );
    }

    await Team.updateOne(
      { _id: team._id },
      { $addToSet: { members: user._id } }
    );

    user.team = team._id;
    await user.save();

    const updated = await User.findById(user._id)
      .select("name email role team")
      .populate("team", "name")
      .lean();

    res.json({ message: "User team updated", user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listUsersAdmin = async (req, res) => {
  try {
    const { q, role, page, pageSize, teamId } = req.query;

    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(200, Math.max(1, Number(pageSize) || 20));
    const skip = (safePage - 1) * safePageSize;

    const filter = {};

    if (role) {
      const safeRole = String(role).trim().toLowerCase();
      filter.role = safeRole;
    }

    if (teamId) {
      filter.team = teamId;
    }

    if (q) {
      const rx = new RegExp(String(q), "i");
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .select("name email role team")
        .populate("team", "name")
        .sort({ name: 1 })
        .skip(skip)
        .limit(safePageSize)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.json({ items, total, page: safePage, pageSize: safePageSize });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
