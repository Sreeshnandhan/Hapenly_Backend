import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { JWT_SECRET } from "../config/env";

interface SignupInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "USER" | "ORGANIZER";
}

export async function signup(data: SignupInput) {
  const { name, email, password, phone, role = "USER" } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone ?? null,
      passwordHash,
      role,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

interface LoginInput {
  email: string;
  password: string;
}

export async function login(data: LoginInput) {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      authVersion: user.authVersion,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token,
  };
}

export async function getUserById(userId: string | number, authVersion = 0) {
  const numericId = typeof userId === "string" ? Number(userId) : userId;

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: numericId },
  });

  if (!user || user.authVersion !== authVersion) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}
