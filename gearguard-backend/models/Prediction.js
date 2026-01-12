import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment",
    required: true
  },

  temperature: Number,
  vibration: Number,
  power: Number,
  runtime: Number,

  anomaly: {
    type: Boolean,
    required: true
  },

  riskScore: {
    type: Number, // 0–100
    required: true
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true
  },

  explanation: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Prediction", predictionSchema);
