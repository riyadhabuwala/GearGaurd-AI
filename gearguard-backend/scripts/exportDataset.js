import mongoose from "mongoose";
import dotenv from "dotenv";
import SensorLog from "../models/SensorLog.js";
import Request from "../models/Request.js";
import fs from "fs";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true
});

const run = async () => {
  const logs = await SensorLog.find().sort({ timestamp: 1 });
  const failures = await Request.find({ type: "corrective" }).sort({ createdAt: 1 });

  // Group logs by equipment
  const logsByEquipment = {};
  logs.forEach(l => {
    const id = l.equipment.toString();
    if (!logsByEquipment[id]) logsByEquipment[id] = [];
    logsByEquipment[id].push(l);
  });

  let labels = new Map(); // logId -> 0 or 1

  // initialize all logs as 0
  logs.forEach(l => labels.set(l._id.toString(), 0));

  // for each failure, mark last 5 logs before it as 1
  for (let f of failures) {
    const eq = f.equipment.toString();
    const time = new Date(f.createdAt).getTime();

    const eqLogs = logsByEquipment[eq] || [];
    const before = eqLogs.filter(l => new Date(l.timestamp).getTime() < time);

    const lastFive = before.slice(-5);

    lastFive.forEach(l => labels.set(l._id.toString(), 1));
  }

  let csv = "equipment,temperature,vibration,power,runtime,failed\n";

  for (let l of logs) {
    csv += `${l.equipment},${l.temperature},${l.vibration},${l.powerUsage},${l.runtimeHours},${labels.get(l._id.toString())}\n`;
  }

  fs.writeFileSync("dataset.csv", csv);
  console.log("dataset.csv created");
  process.exit();
};

run();
