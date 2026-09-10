import { Router } from "express";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", authenticate, (req: AuthRequest, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
    user: req.user,
  });
});

router.get(
  "/user-only",
  authenticate,
  authorize("USER"),
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      message: "Only normal users can access this",
      user: req.user,
    });
  },
);

router.get(
  "/organizer-only",
  authenticate,
  authorize("ORGANIZER"),
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      message: "Only organizers can access this",
      user: req.user,
    });
  },
);

router.get(
  "/admin-only",
  authenticate,
  authorize("ADMIN"),
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      message: "Only admins can access this",
      user: req.user,
    });
  },
);

export default router;
