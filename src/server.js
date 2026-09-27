"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
const allowedOrigins = [
    env_1.FRONTEND_URL,
    "http://localhost:8443",
    "http://127.0.0.1:8443",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests without an origin (Postman, server-to-server, etc.)
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Hapnely API is running",
    });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/events", event_routes_1.default);
app.listen(env_1.PORT, () => {
    console.log(`Server running on port ${env_1.PORT}`);
});
//# sourceMappingURL=server.js.map