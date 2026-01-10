import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import protect from "./middleware/auth.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import sensorRoutes from "./routes/sensorRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("GearGuard AI Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

app.use("/api/auth", authRoutes);
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You are authorized",
    user: req.user
  });
});


app.use("/api/equipment", equipmentRoutes);

app.use("/api/teams", teamRoutes);

app.use("/api/requests", requestRoutes);

app.use("/api/sensors", sensorRoutes);
