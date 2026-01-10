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
  const logs = await SensorLog.find();
  const failures = await Request.find({ type: "corrective" });

  const failureTimes = failures.map(f => ({
    equipment: f.equipment.toString(),
    time: new Date(f.createdAt).getTime()
  }));

  let csv = "equipment,temperature,vibration,power,runtime,failed\n";

  for (let log of logs) {
    const logTime = new Date(log.timestamp).getTime();
    const eq = log.equipment.toString();

    let failed = 0;
    for (let f of failureTimes) {
        if (f.equipment === eq && f.time > logTime &&  (f.time - logTime) < 3600 * 1000  ) {
            failed = 1;
        }

    }

    csv += `${eq},${log.temperature},${log.vibration},${log.powerUsage},${log.runtimeHours},${failed}\n`;
  }

  fs.writeFileSync("dataset.csv", csv);
  console.log("dataset.csv created");
  process.exit();
};

run();
