import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { getUserById } from "../services/auth.service";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: "USER" | "ORGANIZER" | "ADMIN";
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    // Get JWT from HttpOnly cookie
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: "USER" | "ORGANIZER" | "ADMIN";
      authVersion?: number;
    };

    const user = await getUserById(decoded.userId, decoded.authVersion ?? 0);
    if (!user)
      return res
        .status(401)
        .json({
          success: false,
          message: "Session expired. Please sign in again.",
        });

    req.user = {
      userId: decoded.userId,
      role: user.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

export function authorize(
  ...allowedRoles: Array<"USER" | "ORGANIZER" | "ADMIN">
) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
}
