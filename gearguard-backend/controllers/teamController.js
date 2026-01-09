import Team from "../models/Team.js";
import User from "../models/User.js";

export const createTeam = async (req, res) => {
  try {
    const team = await Team.create({ name: req.body.name });
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);
    const user = await User.findById(userId);

    if (!team || !user) {
      return res.status(404).json({ message: "Team or User not found" });
    }

    team.members.push(user._id);
    user.team = team._id;

    await team.save();
    await user.save();

    res.json({ message: "Member added to team", team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
