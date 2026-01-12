import Request from "../models/Request.js";

export const getFailureHistory = async (equipmentId) => {
  const failures = await Request.find({
    equipment: equipmentId,
    type: "corrective"
  })
    .sort({ createdAt: -1 })
    .limit(5);

  if (failures.length === 0) {
    return "No previous failures recorded.";
  }

  return failures
    .map(f => {
      return `Date: ${f.createdAt.toISOString().split("T")[0]}, Issue: ${f.subject}, Downtime: ${f.duration || "unknown"} hours`;
    })
    .join("\n");
};
