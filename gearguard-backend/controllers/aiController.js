import axios from "axios";
import Request from "../models/Request.js";
import Equipment from "../models/Equipment.js";
import { getFailureHistory } from "../utils/ragEngine.js";
import { generateExplanation } from "../utils/explainAI.js";
import { computePriority } from "../utils/riskEngine.js";

export const runAIScan = async (req, res) => {
  try {
    // 1. Call Python AI service
    const { data } = await axios.get("http://127.0.0.1:8000/predict");

    let created = 0;
    let skipped = 0;

    for (let row of data) {
      const equipmentId = row.equipment;

      // 2. Load equipment
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        skipped++;
        continue;
      }

      // 3. Prevent duplicate predictive tickets
      const existing = await Request.findOne({
        equipment: equipmentId,
        type: "predictive",
        status: { $ne: "repaired" }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // 4. RAG – fetch historical failures
      const history = await getFailureHistory(equipmentId);

      // 5. Compute priority
      const priority = computePriority(
        row.temperature,
        row.vibration,
        history.length
      );

      // 6. Generate AI explanation via Groq
      const explanation = await generateExplanation(row, history);

      // 7. Create predictive maintenance ticket
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
