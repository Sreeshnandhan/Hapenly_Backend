"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.getUserById = getUserById;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const env_1 = require("../config/env");
async function signup(data) {
    const { name, email, password, phone, role = "USER" } = data;
    const existingUser = await prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) {
        throw new Error("Email is already registered");
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = await prisma_1.default.user.create({
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
async function login(data) {
    const { email, password } = data;
    const user = await prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const passwordMatches = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!passwordMatches) {
        throw new Error("Invalid email or password");
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        role: user.role,
    }, env_1.JWT_SECRET, {
        expiresIn: "7d",
    });
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
async function getUserById(userId) {
    const numericId = typeof userId === "string" ? parseInt(userId, 10) : userId;
    if (isNaN(numericId))
        return null;
    const user = await prisma_1.default.user.findUnique({
        where: { id: numericId },
    });
    if (!user)
        return null;
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
    };
}
//# sourceMappingURL=auth.service.js.map