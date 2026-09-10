import prisma from "../lib/prisma";

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
}

export async function createEvent(data: CreateEventInput) {
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

    organizerId,
  } = data;

  // Check category exists
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Validate total seats
  if (totalSeats <= 0) {
    throw new Error("Total seats must be greater than zero");
  }

  // Validate ticket price
  if (ticketPrice < 0) {
    throw new Error("Ticket price cannot be negative");
  }

  // Create event
  const event = await prisma.event.create({
    data: {
      name,
      description,
      categoryId,

      date: new Date(date),
      startTime,
      duration,

      location,
      hostedBy,
      ageRequirement,

      totalSeats,

      // Initially all seats are available
      availableSeats: totalSeats,

      // Single ticket price
      ticketPrice,

      organizerId,

      // Event waits for admin review
      status: "SUBMITTED",
    },

    include: {
      category: true,
    },
  });

  return event;
}
