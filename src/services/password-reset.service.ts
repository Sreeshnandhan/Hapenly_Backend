import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { FRONTEND_URL } from "../config/env";

export const RESET_MESSAGE =
  "If an account matches that email, you will receive a password reset link. Check your inbox and spam folder.";
export const INVALID_RESET_MESSAGE = "This reset link is invalid or expired. Please request a new one.";
export class InvalidResetTokenError extends Error {
  constructor() { super(INVALID_RESET_MESSAGE); }
}

export function passwordError(password: unknown): string | null {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  // bcrypt only considers the first 72 UTF-8 bytes.
  if (Buffer.byteLength(password, "utf8") > 72) {
    return "Password must be no more than 72 bytes (use fewer characters).";
  }
  return null;
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function resetEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("Password reset email is not configured");
  const url = new URL(FRONTEND_URL!);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" &&
      url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new Error("FRONTEND_URL must use HTTPS in production");
  }
  return { apiKey, from, url };
}

export async function requestPasswordReset(email: string) {
  const { apiKey, from, url } = resetEmailConfig();
  // Preserve exact-case matching for accounts created before email normalization.
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = new Date();
  // The database enforces a cooldown across requests and server instances.
  const issued = await prisma.user.updateMany({
    where: {
      id: user.id,
      authVersion: user.authVersion,
      OR: [
        { passwordResetRequestedAt: null },
        { passwordResetRequestedAt: { lte: new Date(now.getTime() - 60_000) } },
      ],
    },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: new Date(now.getTime() + 15 * 60_000),
      passwordResetRequestedAt: now,
    },
  });
  if (!issued.count) return;

  // A fragment is not sent to the frontend host in an HTTP request or referrer.
  // Root URL also works on Vercel without adding a client-side route rewrite.
  url.pathname = "/";
  url.search = "";
  url.hash = `reset-password=${token}`;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `password-reset-${tokenHash}`,
      },
      body: JSON.stringify({
        from,
        to: [user.email],
        subject: "Reset your Hapenly password",
        text: `Use this link to choose a new password:\n\n${url.toString()}\n\nThis link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Reset email provider returned ${response.status}`);
  } catch (error) {
    // Do not erase a newer token issued by a concurrent request.
    await prisma.user.updateMany({
      where: { id: user.id, passwordResetTokenHash: tokenHash },
      data: { passwordResetTokenHash: null, passwordResetExpiresAt: null },
    });
    throw error;
  }
}

export async function resetPassword(token: string, password: string) {
  const validationError = passwordError(password);
  if (validationError) throw new Error(validationError);
  if (!/^[a-f0-9]{64}$/.test(token)) throw new InvalidResetTokenError();

  const tokenHash = hashToken(token);
  const user = await prisma.user.findFirst({
    where: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { gt: new Date() } },
    select: { id: true },
  });
  if (!user) throw new InvalidResetTokenError();

  const passwordHash = await bcrypt.hash(password, 12);
  // Consume and replace in one atomic statement. Only one concurrent reset wins.
  const result = await prisma.user.updateMany({
    where: { id: user.id, passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { gt: new Date() } },
    data: {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      authVersion: { increment: 1 },
    },
  });
  if (!result.count) throw new InvalidResetTokenError();
}
