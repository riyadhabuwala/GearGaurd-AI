import mongoose from "mongoose";
import dotenv from "dotenv";
import Equipment from "../models/Equipment.js";
import SensorLog from "../models/SensorLog.js";
import Request from "../models/Request.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const rand = (min, max) => Math.random() * (max - min) + min;

const run = async () => {
  const equipments = await Equipment.find();

  for (let eq of equipments) {
    let baseTemp = rand(40, 55);
    let baseVib = rand(1, 2);

    for (let i = 0; i < 300; i++) {

      baseTemp += rand(-0.1, 0.4);
      baseVib += rand(-0.02, 0.08);

      const temperature = Math.max(30, baseTemp);
      const vibration = Math.max(0.5, baseVib);
      const powerUsage = rand(5, 15);
      const runtimeHours = rand(1, 10);

      // create sensor reading with its own timestamp
      const log = await SensorLog.create({
        equipment: eq._id,
        temperature,
        vibration,
        powerUsage,
        runtimeHours,
        timestamp: new Date()
      });

      // probabilistic failure
      if (
        temperature > 82 &&
        vibration > 4.8 &&
        Math.random() < 0.05
      ) {
        await Request.create({
          subject: "AI-detected breakdown",
          type: "corrective",
          equipment: eq._id,
          team: eq.assignedTeam,
          status: "repaired",
          duration: rand(1, 6),
          createdAt: log.timestamp   // 🔥 align failure time with sensor time
        });

        // strong recovery after repair
        baseTemp = rand(35, 45);
        baseVib = rand(0.8, 1.5);

        // cooldown
        i += 10;
      }
    }
  }

  console.log("Sensor telemetry generated");
  process.exit();
};

run();
