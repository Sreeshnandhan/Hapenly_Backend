import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { createEvent } from "../controllers/event.controller";
import {
  listEventRequests,
  listEventCategories,
} from "../controllers/admin-event.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import type { AuthRequest } from "../middleware/auth.middleware";
import { parseEventUpload } from "../middleware/event-upload.middleware";

const router = Router();
const submissionLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => String((req as AuthRequest).user!.userId),
  message: { message: "Too many submissions. Please try again later." },
});
router.get(
  "/categories",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  listEventCategories,
);
router.get(
  "/admin/requests",
  authenticate,
  authorize("ADMIN"),
  listEventRequests,
);
router.post(
  "/",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  submissionLimit,
  parseEventUpload,
  createEvent,
);
export default router;
