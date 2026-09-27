import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

const isDatabaseUnavailable = (error: unknown): boolean => {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P1001" || error.code === "P1002";
  }

  return false;
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

// SIGNUP
export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (role && role !== "USER" && role !== "ORGANIZER") {
      return res.status(400).json({
        success: false,
        message: "Invalid account type.",
      });
    }

    const user = await authService.signup({
      name,
      email,
      password,
      phone,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    // Actual error appears only in your backend logs.
    console.error("Signup failed:", error);

    if (isDatabaseUnavailable(error)) {
      return res.status(503).json({
        success: false,
        message:
          "Our service is temporarily unavailable. Please try again in a few minutes.",
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered. Please sign in.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "Email is already registered"
    ) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered. Please sign in.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while creating your account. Please try again.",
    });
  }
}

// LOGIN
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const result = await authService.login({
      email,
      password,
    });

    res.cookie("jwt", result.token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: result.user,
    });
  } catch (error) {
    console.error("Login failed:", error);

    if (isDatabaseUnavailable(error)) {
      return res.status(503).json({
        success: false,
        message:
          "Our service is temporarily unavailable. Please try again in a few minutes.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to sign in right now. Please try again later.",
    });
  }
}

// LOGOUT
export async function logout(_: Request, res: Response) {
  res.clearCookie("jwt", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out.",
  });
}

// CURRENT USER
export async function me(req: Request, res: Response) {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated.",
    });
  }

  let payload: { userId: string | number };

  try {
    payload = jwt.verify(token, JWT_SECRET) as {
      userId: string | number;
    };
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please sign in again.",
    });
  }

  try {
    const user = await authService.getUserById(payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Session is no longer valid. Please sign in again.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Fetch current user failed:", error);

    return res.status(isDatabaseUnavailable(error) ? 503 : 500).json({
      success: false,
      message: "Unable to load your account right now. Please try again later.",
    });
  }
}
