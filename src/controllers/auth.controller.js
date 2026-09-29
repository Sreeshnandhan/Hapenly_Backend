"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.logout = logout;
exports.me = me;
const express_1 = require("express");
const authService = __importStar(require("../services/auth.service"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const isDatabaseUnavailable = (error) => {
    if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        return true;
    }
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        return error.code === "P1001" || error.code === "P1002";
    }
    return false;
};
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production"
    ? ("none" as const)
    : ("lax" as const),
};
// SIGNUP
async function signup(req, res) {
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
    }
    catch (error) {
        // Actual error appears only in your backend logs.
        console.error("Signup failed:", error);
        if (isDatabaseUnavailable(error)) {
            return res.status(503).json({
                success: false,
                message: "Our service is temporarily unavailable. Please try again in a few minutes.",
            });
        }
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "This email is already registered. Please sign in.",
            });
        }
        if (error instanceof Error &&
            error.message === "Email is already registered") {
            return res.status(409).json({
                success: false,
                message: "This email is already registered. Please sign in.",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating your account. Please try again.",
        });
    }
}
// LOGIN
async function login(req, res) {
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
    }
    catch (error) {
        console.error("Login failed:", error);
        if (isDatabaseUnavailable(error)) {
            return res.status(503).json({
                success: false,
                message: "Our service is temporarily unavailable. Please try again in a few minutes.",
            });
        }
        if (error instanceof Error &&
            error.message === "Invalid email or password") {
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
async function logout(_, res) {
    res.clearCookie("jwt", cookieOptions);
    return res.status(200).json({
        success: true,
        message: "Logged out.",
    });
}
// CURRENT USER
async function me(req, res) {
    const token = req.cookies?.jwt;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated.",
        });
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
    }
    catch {
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
    }
    catch (error) {
        console.error("Fetch current user failed:", error);
        return res.status(isDatabaseUnavailable(error) ? 503 : 500).json({
            success: false,
            message: "Unable to load your account right now. Please try again later.",
        });
    }
}
//# sourceMappingURL=auth.controller.js.map