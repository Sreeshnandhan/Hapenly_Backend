import prisma from "../lib/prisma";
import {
  EventInputError,
  validateEventImage,
  uploadEventImage,
  deleteEventImage,
} from "./event-image.service";

interface CreateEventInput {
  name: string;
  description: string;
  categoryId: number;
  date: string;
  startTime: string;
  duration: string;
  location: string;
  hostedBy: string;
  ageRequirement?: string;
  totalSeats: number;
  ticketPrice: number;
  organizerId: number;
  organizerName?: string;
  organizerPhone?: string;
  imageBuffer?: Buffer;
}

export async function createEvent(data: CreateEventInput) {
  if (!Number.isSafeInteger(data.categoryId) || data.categoryId <= 0)
    throw new EventInputError("Choose a valid category.");
  if (
    !Number.isSafeInteger(data.totalSeats) ||
    data.totalSeats < 1 ||
    data.totalSeats > 100000
  )
    throw new EventInputError(
      "Seats must be a whole number between 1 and 100000.",
    );
  if (
    !Number.isFinite(data.ticketPrice) ||
    data.ticketPrice < 0 ||
    data.ticketPrice > 99999999.99 ||
    Math.abs(data.ticketPrice * 100 - Math.round(data.ticketPrice * 100)) >
      0.00001
  )
    throw new EventInputError(
      "Enter a valid ticket price with no more than two decimal places.",
    );
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date))
    throw new EventInputError("Enter a valid event date.");
  const eventDate = new Date(`${data.date}T00:00:00.000Z`);
  if (
    !Number.isFinite(eventDate.getTime()) ||
    eventDate.toISOString().slice(0, 10) !== data.date
  )
    throw new EventInputError("Enter a valid event date.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.startTime))
    throw new EventInputError("Enter the event time in HH:mm format.");
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category)
    throw new EventInputError(
      "Category not found. Refresh the form and try again.",
    );
  let uploaded:
    | {
        url: string;
        publicId: string;
      }
    | undefined;
  if (data.imageBuffer)
    uploaded = await uploadEventImage(
      await validateEventImage(data.imageBuffer),
    );
  try {
    return await prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        date: eventDate,
        startTime: data.startTime,
        duration: data.duration,
        location: data.location,
        hostedBy: data.hostedBy,
        ageRequirement: data.ageRequirement,
        totalSeats: data.totalSeats,
        availableSeats: data.totalSeats,
        ticketPrice: data.ticketPrice,
        organizerId: data.organizerId,
        organizerName: data.organizerName,
        organizerPhone: data.organizerPhone,
        imageUrl: uploaded?.url,
        imagePublicId: uploaded?.publicId,
        status: "SUBMITTED",
      },
      include: { category: true },
    });
  } catch (error) {
    if (uploaded) {
      try {
        await deleteEventImage(uploaded.publicId);
      } catch {
        console.error(
          "Could not remove orphaned event image:",
          uploaded.publicId,
        );
      }
    }
    throw error;
  }
}
