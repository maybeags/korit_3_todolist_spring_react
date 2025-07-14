"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = void 0;
const userRepository_1 = require("../repositories/userRepository");
const getUserProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield (0, userRepository_1.findUserProfileById)(Number(userId));
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { nickname, location, profileImage } = req.body;
    const userId = req.userId; // Get userId from authenticated request
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const user = yield (0, userRepository_1.findUserProfileById)(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        yield (0, userRepository_1.updateUserProfileById)(userId, nickname, location, profileImage);
        res.status(200).json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUserProfile = updateUserProfile;
