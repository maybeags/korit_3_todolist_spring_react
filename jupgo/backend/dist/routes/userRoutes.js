"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.get('/user/profile/:userId', userController_1.getUserProfile);
router.put('/user/profile', userController_1.updateUserProfile);
exports.default = router;
