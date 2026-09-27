"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRONTEND_URL = exports.JWT_SECRET = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 5000;
exports.PORT = PORT;
const JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_SECRET = JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
exports.FRONTEND_URL = FRONTEND_URL;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}
if (!FRONTEND_URL) {
    throw new Error("FRONTEND_URL is not defined");
}
//# sourceMappingURL=env.js.map