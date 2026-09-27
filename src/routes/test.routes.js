"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/profile", auth_middleware_1.authenticate, (req, res) => {
    res.json({
        success: true,
        message: "You are authenticated",
        user: req.user,
    });
});
router.get("/user-only", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("USER"), (req, res) => {
    res.json({
        success: true,
        message: "Only normal users can access this",
        user: req.user,
    });
});
router.get("/organizer-only", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ORGANIZER"), (req, res) => {
    res.json({
        success: true,
        message: "Only organizers can access this",
        user: req.user,
    });
});
router.get("/admin-only", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), (req, res) => {
    res.json({
        success: true,
        message: "Only admins can access this",
        user: req.user,
    });
});
exports.default = router;
//# sourceMappingURL=test.routes.js.map