"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvent = createEvent;
const prisma_1 = __importDefault(require("../lib/prisma"));
async function createEvent(data) {
    const { name, description, categoryId, date, startTime, duration, location, hostedBy, ageRequirement, totalSeats, ticketPrice, organizerId, } = data;
    // Check category exists
    const category = await prisma_1.default.category.findUnique({
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
    const event = await prisma_1.default.event.create({
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
//# sourceMappingURL=event.service.js.map