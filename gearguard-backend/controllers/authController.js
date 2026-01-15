import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const safeEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!safeEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await User.findOne({ email: safeEmail });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: safeEmail,
      password: hashed,
      role
    });

    res.status(201).json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const safeEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!safeEmail) return res.status(400).json({ message: "Email is required" });

    // Case-insensitive fallback for legacy users created before email normalization
    const user =
      (await User.findOne({ email: safeEmail })) ||
      (await User.findOne({ email: new RegExp(`^${safeEmail.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "i") }));
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
