import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;   // { id, role }
    next();

  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

export default protect;
