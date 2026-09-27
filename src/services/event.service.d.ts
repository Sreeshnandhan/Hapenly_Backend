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
export declare function createEvent(data: CreateEventInput): Promise<{
    id: number;
    name: string;
    description: string;
    date: Date;
    startTime: string;
    duration: string;
    location: string;
    hostedBy: string;
    ageRequirement: string | null;
    totalSeats: number;
    availableSeats: number;
    ticketPrice: import("@prisma/client/runtime/library").Decimal;
    status: import(".prisma/client").$Enums.EventStatus;
    organizerId: number;
    categoryId: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export {};
//# sourceMappingURL=event.service.d.ts.map