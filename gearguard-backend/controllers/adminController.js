import Equipment from "../models/Equipment.js";
import Prediction from "../models/Prediction.js";
import Request from "../models/Request.js";
import Team from "../models/Team.js";
import User from "../models/User.js";

function bucketRisk(score) {
  const n = Number(score || 0);
  if (n >= 76) return "critical";
  if (n >= 51) return "high";
  if (n >= 26) return "medium";
  return "low";
}

export const getAdminDashboard = async (req, res) => {
  try {
    const [equipmentScores, topRiskEquipment, latestPredictions, latestTickets, teams, technicians] =
      await Promise.all([
        Equipment.find({ status: "active" }).select("riskScore"),
        Equipment.find({ status: "active" })
          .sort({ riskScore: -1, updatedAt: -1 })
          .limit(5)
          .select("name department location serialNumber riskScore assignedTeam")
          .populate("assignedTeam", "name"),
        Prediction.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("equipment", "name department location riskScore")
          .select("equipment riskScore priority anomaly explanation createdAt"),
        Request.find()
          .sort({ createdAt: -1 })
          .limit(15)
          .populate("equipment", "name department location riskScore")
          .populate("team", "name")
          .populate("assignedTo", "name")
          .populate("createdBy", "name email")
          .select(
            "subject type priority status scheduledDate duration aiExplanation createdAt equipment team assignedTo createdBy"
          ),
        Team.find()
          .sort({ createdAt: -1 })
          .limit(15)
          .populate("members", "name role"),
        User.find({ role: "technician" })
          .select("name email team")
          .populate("team", "name"),
      ]);

    const riskDistribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const eq of equipmentScores) {
      const bucket = bucketRisk(eq.riskScore);
      riskDistribution[bucket] += 1;
    }

    const criticalEquipmentCount = riskDistribution.critical;

    const openTicketsByTeam = await Request.aggregate([
      { $match: { status: { $in: ["new", "in-progress"] } } },
      { $group: { _id: "$team", openTickets: { $sum: 1 } } },
    ]);

    const openTicketsByTeamMap = new Map(
      openTicketsByTeam.map((x) => [String(x._id), x.openTickets])
    );

    const teamSummaries = teams.map((t) => {
      const members = Array.isArray(t.members) ? t.members : [];
      const technicianCount = members.filter((m) => m.role === "technician").length;
      return {
        id: t._id,
        name: t.name,
        memberCount: members.length,
        technicianCount,
        openTickets: openTicketsByTeamMap.get(String(t._id)) ?? 0,
      };
    });

    const utilizationAgg = await Request.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: "$assignedTo",
          openJobs: {
            $sum: {
              $cond: [{ $in: ["$status", ["new", "in-progress"]] }, 1, 0],
            },
          },
          inProgressJobs: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          repairedJobs: {
            $sum: { $cond: [{ $eq: ["$status", "repaired"] }, 1, 0] },
          },
          totalDurationHours: { $sum: { $ifNull: ["$duration", 0] } },
          repairedWithDuration: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "repaired"] },
                    { $gt: [{ $ifNull: ["$duration", 0] }, 0] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const utilMap = new Map(utilizationAgg.map((x) => [String(x._id), x]));

    const technicianUtilization = technicians
      .map((t) => {
        const stats = utilMap.get(String(t._id)) ?? {
          openJobs: 0,
          inProgressJobs: 0,
          repairedJobs: 0,
          totalDurationHours: 0,
          repairedWithDuration: 0,
        };

        const avgRepairHours =
          stats.repairedWithDuration > 0
            ? Number(stats.totalDurationHours) / Number(stats.repairedWithDuration)
            : null;

        return {
          id: t._id,
          name: t.name,
          email: t.email,
          team: t.team ? { id: t.team._id, name: t.team.name } : null,
          openJobs: stats.openJobs,
          inProgressJobs: stats.inProgressJobs,
          repairedJobs: stats.repairedJobs,
          avgRepairHours,
        };
      })
      .sort((a, b) => (b.inProgressJobs - a.inProgressJobs) || (b.openJobs - a.openJobs));

    res.json({
      criticalEquipmentCount,
      riskDistribution,
      technicianUtilization,
      aiPredictedFailures: latestPredictions,
      tickets: latestTickets,
      teams: teamSummaries,
      topRiskEquipment,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
