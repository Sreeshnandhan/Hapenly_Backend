import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";
import { PORT, FRONTEND_URL } from "./config/env";

const app = express();

// Set only to the verified number of reverse proxies in your deployment.
const proxyHops = Number(process.env.TRUST_PROXY_HOPS || "0");
if (!Number.isInteger(proxyHops) || proxyHops < 0)
  throw new Error("Invalid TRUST_PROXY_HOPS");
if (proxyHops > 0) app.set("trust proxy", proxyHops);

const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:8443",
  "http://127.0.0.1:8443",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin (Postman, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(cookieParser());
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
  console.log(`Server running on port ${PORT}`);
});
