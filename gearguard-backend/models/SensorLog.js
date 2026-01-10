import mongoose from "mongoose";

const sensorLogSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment",
    required: true
  },

  temperature: Number,     // °C
  vibration: Number,       // arbitrary unit
  powerUsage: Number,      // kW
  runtimeHours: Number,    // since last service

  timestamp: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("SensorLog", sensorLogSchema);
