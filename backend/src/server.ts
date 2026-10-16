// Must be first: other modules read process.env at import time
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import { errorMiddleware } from "./middleware/error.middleware";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const app = express();

const PORT = Number(process.env.PORT || 5000);

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Parse JSON
app.use(express.json({ limit: "10kb" }));

// Parse cookies
app.use(cookieParser());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

// Error handler
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
