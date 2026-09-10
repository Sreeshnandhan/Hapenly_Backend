import { Router } from "express";

import { createEvent } from "../controllers/event.controller";

import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, authorize("ORGANIZER"), createEvent);

export default router;
