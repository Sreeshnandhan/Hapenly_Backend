import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import * as eventService from "../services/event.service";

export async function createEvent(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      name,
      description,
      categoryId,
      date,
      startTime,
      duration,
      location,
      hostedBy,
      ageRequirement,
      totalSeats,
      ticketPrice,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !categoryId ||
      !date ||
      !startTime ||
      !duration ||
      !location ||
      !hostedBy ||
      !totalSeats ||
      ticketPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required event fields must be provided",
      });
    }

    const event = await eventService.createEvent({
      name,
      description,
      categoryId: Number(categoryId),

      date,
      startTime,
      duration,

      location,
      hostedBy,
      ageRequirement,

      totalSeats: Number(totalSeats),
      ticketPrice: Number(ticketPrice),

      organizerId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Event submitted successfully",
      event,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}
