import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["corrective","preventive","predictive"],
    required: true
  },

  priority: {
    type: String,
    enum: ["low","medium","high"],
    default: "medium"
  },

  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment",
    required: true
  },

  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["new", "in-progress", "repaired", "scrap"],
    default: "new"
  },

  scheduledDate: {
    type: Date
  },

  duration: {
    type: Number   // hours spent
  },
  aiExplanation: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

export default mongoose.model("Request", requestSchema);
