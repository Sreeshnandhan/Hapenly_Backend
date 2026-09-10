import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";
import { PORT } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Hapnely API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
