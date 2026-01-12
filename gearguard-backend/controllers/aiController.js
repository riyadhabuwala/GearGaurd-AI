import axios from "axios";
import Request from "../models/Request.js";
import Equipment from "../models/Equipment.js";
import Prediction from "../models/Prediction.js";
import { getFailureHistory } from "../utils/ragEngine.js";
import { generateExplanation } from "../utils/explainAI.js";
import { computeRiskScore, computePriority } from "../utils/riskEngine.js";

export const runAIScan = async (req, res) => {
  try {
    // 1️⃣ Call Python ML service
    const { data } = await axios.get("http://127.0.0.1:8000/predict");

    let created = 0;
    let skipped = 0;

    for (let row of data) {
      const equipmentId = row.equipment;

      // 2️⃣ Load equipment
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        skipped++;
        continue;
      }

      // 3️⃣ Calculate risk from sensors
      const risk = computeRiskScore(row);
      const priority = computePriority(risk);

      // 4️⃣ RAG – get maintenance memory
      const history = await getFailureHistory(equipmentId);

      // 5️⃣ LLM – explain why this is risky
      const explanation = await generateExplanation(row, history);

      // 6️⃣ Save prediction snapshot
      await Prediction.create({
        equipment: equipmentId,
        temperature: row.temperature,
        vibration: row.vibration,
        power: row.power,
        runtime: row.runtime,
        anomaly: true,
        riskScore: risk,
        priority,
        explanation
      });

      // 7️⃣ Prevent duplicate AI tickets
      const existing = await Request.findOne({
        equipment: equipmentId,
        type: "predictive",
        status: { $ne: "repaired" }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // 8️⃣ Create predictive maintenance ticket
      await Request.create({
        subject: "AI predicted failure",
        type: "predictive",
        equipment: equipmentId,
        team: equipment.assignedTeam,
        priority,
        status: "new",
        aiExplanation: explanation
      });

      created++;
    }

    res.json({
      message: "AI scan completed",
      ticketsCreated: created,
      skipped
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
