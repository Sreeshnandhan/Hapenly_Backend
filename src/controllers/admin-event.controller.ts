import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../lib/prisma";
import { error } from "node:console";

export async function listEventCategories(_req: AuthRequest, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return res.json({ success: true, categories });
  } catch {
    return res
      .status(503)
      .json({ message: "Unable to load event categories." });
  }
}
export async function listEventRequests(req: AuthRequest, res: Response) {
  if (req.user?.role !== "ADMIN")
    return res.status(403).json({ message: "Admin access required." });
  const page = Number(req.query.page ?? 1);
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000)
    return res.status(400).json({ message: "Invalid page." });
  const where = {
    status: {
      in: ["SUBMITTED", "UNDER_REVIEW"] as Array<"SUBMITTED" | "UNDER_REVIEW">,
    },
  };
  try {
    const [events, total] = await prisma.$transaction([
      prisma.event.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * 20,
        take: 20,
        include: {
          category: true,
          organizer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);
    return res.json({ success: true, events, page, pageSize: 20, total });
  } catch (error) {
    console.error("Admin event requests failed:", error);

    return res.status(503).json({
      success: false,
      message: "Unable to load event requests. Please try again.",
    });
  }
}
