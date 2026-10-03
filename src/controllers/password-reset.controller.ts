import type { Request, Response } from "express";
import {
  RESET_MESSAGE, InvalidResetTokenError, passwordError,
  requestPasswordReset, resetPassword, resetEmailConfig,
} from "../services/password-reset.service";

export async function forgotPassword(req: Request, res: Response) {
  const email = req.body?.email;
  if (typeof email !== "string" || email.trim().length > 254 || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  try {
    resetEmailConfig();
  } catch {
    return res.status(503).json({ message: "Password reset is temporarily unavailable. Please try again later." });
  }
  // Respond before the account lookup/email delivery so neither account existence
  // nor email-provider timing changes the public response.
  res.status(202).json({ success: true, message: RESET_MESSAGE });
  try {
    await requestPasswordReset(email.trim());
  } catch {
    // Never log the raw token, reset URL, password, or provider response body.
    console.error("Password reset request failed. Check database and email provider availability.");
  }
}

export async function completePasswordReset(req: Request, res: Response) {
  const { token, password } = req.body ?? {};
  const message = passwordError(password);
  if (message) return res.status(400).json({ message });
  if (typeof token !== "string") return res.status(400).json({ message: "A reset token is required." });
  try {
    await resetPassword(token, password);
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.json({ success: true, message: "Password updated. Please sign in with your new password." });
  } catch (error) {
    if (error instanceof InvalidResetTokenError) return res.status(400).json({ message: error.message });
    return res.status(503).json({ message: "Unable to reset your password right now. Please try again later." });
  }
}
