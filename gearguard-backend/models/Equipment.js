import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  serialNumber: {
    type: String,
    required: true,
    unique: true
  },

  department: {
    type: String,
    required: true
  },

  location: {
    type: String
  },

  assignedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },

  purchaseDate: {
    type: Date
  },

  warrantyTill: {
    type: Date
  },

  status: {
    type: String,
    enum: ["active", "scrapped"],
    default: "active"
  },

  riskScore: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

export default mongoose.model("Equipment", equipmentSchema);
