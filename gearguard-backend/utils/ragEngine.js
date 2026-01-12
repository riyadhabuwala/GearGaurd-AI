import Request from "../models/Request.js";

export const getFailureHistory = async (equipmentId) => {
  const failures = await Request.find({
    equipment: equipmentId,
    type: "corrective"
  })
    .sort({ createdAt: -1 })
    .limit(5);

  return failures.map(f => ({
    date: f.createdAt,
    subject: f.subject,
    duration: f.duration
  }));
};
