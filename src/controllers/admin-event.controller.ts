import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../lib/prisma";

export async function listEventRequests(req: AuthRequest, res: Response) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  const page = Number(req.query.page ?? 1);

  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) {
    return res.status(400).json({
      success: false,
      message: "Invalid page.",
    });
  }

  const pageSize = 20;

  try {
    const events = await prisma.event.findMany({
      where: {
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW"],
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      events,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("List event requests failed:", error);

    return res.status(503).json({
      success: false,
      message: "Unable to load event requests. Please try again later.",
    });
  }
}
