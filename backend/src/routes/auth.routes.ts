import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  me,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Stricter limit on credential endpoints to slow down brute forcing
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts, please try again later",
  },
});

router.post("/register", credentialLimiter, register);

router.post("/login", credentialLimiter, login);

router.post("/logout", logout);

router.get("/me", authenticate, me);

export default router;
