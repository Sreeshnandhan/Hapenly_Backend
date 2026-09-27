"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ORGANIZER"), event_controller_1.createEvent);
exports.default = router;
//# sourceMappingURL=event.routes.js.map