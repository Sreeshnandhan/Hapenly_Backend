import { Router } from "express";
import { signup, login, logout, me } from "../controllers/auth.controller";
import { rateLimit } from "express-rate-limit";
import {
  forgotPassword,
  completePasswordReset,
} from "../controllers/password-reset.controller";

const router = Router();

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Too many password reset attempts. Please try again in 15 minutes.",
  },
});

router.post("/forgot-password", resetLimiter, forgotPassword);
router.post("/reset-password", resetLimiter, completePasswordReset);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", me);

export default router;
