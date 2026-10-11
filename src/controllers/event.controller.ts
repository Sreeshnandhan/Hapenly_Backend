import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { createEvent as saveEvent } from "../services/event.service";
import { EventInputError } from "../services/event-image.service";

function text(
  body: Record<string, unknown>,
  field: string,
  max: number,
  required = true,
): string | undefined {
  const value = body[field];
  if (!required && (value === undefined || value === "")) return undefined;
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw new EventInputError(
      `Enter a valid ${field} (maximum ${max} characters).`,
    );
  return value.trim();
}
function number(body: Record<string, unknown>, field: string): number {
  const value = body[field];
  if (
    (typeof value !== "string" && typeof value !== "number") ||
    String(value).trim() === ""
  )
    throw new EventInputError(`${field} is required.`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed))
    throw new EventInputError(`Enter a valid ${field}.`);
  return parsed;
}
export async function createEvent(req: AuthRequest, res: Response) {
  if (!req.user)
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  try {
    const body = req.body ?? {};
    const event = await saveEvent({
      name: text(body, "name", 160)!,
      description: text(body, "description", 10000)!,
      categoryId: number(body, "categoryId"),
      date: text(body, "date", 10)!,
      startTime: text(body, "startTime", 5)!,
      duration: text(body, "duration", 100)!,
      location: text(body, "location", 500)!,
      hostedBy: text(body, "hostedBy", 160)!,
      ageRequirement: text(body, "ageRequirement", 100, false),
      totalSeats: number(body, "totalSeats"),
      ticketPrice: number(body, "ticketPrice"),
      organizerId: req.user.userId,
      organizerName: text(body, "organizerName", 160, false),
      organizerPhone: text(body, "organizerPhone", 30, false),
      imageBuffer: req.file?.buffer,
    });
    return res.status(201).json({
      success: true,
      message: "Event submitted for admin review.",
      event,
    });
  } catch (error) {
    if (error instanceof EventInputError)
      return res.status(400).json({ success: false, message: error.message });
    console.error(
      "Event submission failed; check database and image storage availability.",
      error,
    );
    return res.status(503).json({
      success: false,
      message: "Unable to submit the event right now. Please try again.",
    });
  }
}
