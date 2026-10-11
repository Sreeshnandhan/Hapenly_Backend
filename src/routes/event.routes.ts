import { Router } from "express";
import { createEvent } from "../controllers/event.controller";
import { listEventRequests } from "../controllers/admin-event.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Only admins can read submitted event requests.
router.get(
  "/admin/requests",
  authenticate,
  authorize("ADMIN"),
  listEventRequests,
);

// Organizers can submit events for review.
router.post("/", authenticate, authorize("ORGANIZER"), createEvent);

export default router;
