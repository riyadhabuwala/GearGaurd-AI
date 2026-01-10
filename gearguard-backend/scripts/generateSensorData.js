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

    let baseTemp = rand(40, 60);
    let baseVib = rand(1, 3);

    for (let i = 0; i < 300; i++) {

      baseTemp += rand(-0.3, 0.8);
      baseVib += rand(-0.05, 0.2);

      const temperature = Math.max(30, baseTemp);
      const vibration = Math.max(0.5, baseVib);
      const powerUsage = rand(5, 15);
      const runtimeHours = rand(1, 10);

      await SensorLog.create({
        equipment: eq._id,
        temperature,
        vibration,
        powerUsage,
        runtimeHours
      });

      // Failure logic
      if (temperature > 75 && vibration > 4) {
        await Request.create({
          subject: "AI-detected breakdown",
          type: "corrective",
          equipment: eq._id,
          team: eq.assignedTeam,
          status: "repaired",
          duration: rand(1, 6)
        });

        // Reset after repair
        baseTemp = rand(40, 55);
        baseVib = rand(1, 2);
      }
    }
  }

  console.log("Sensor telemetry generated");
  process.exit();
};

run();
