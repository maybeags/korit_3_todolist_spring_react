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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRepository_1 = require("../repositories/userRepository");
dotenv_1.default.config();
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const existingUser = yield (0, userRepository_1.findUserByEmail)(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const passwordHash = yield bcryptjs_1.default.hash(password, salt);
        const userId = yield (0, userRepository_1.createUser)(email, passwordHash);
        yield (0, userRepository_1.createUserProfile)(userId, `User${userId}`, 'Unknown');
        res.status(201).json({ message: 'User registered successfully', user: { id: userId, email: email } });
    }
    catch (error) {
        next(error);
    }
});
exports.signup = signup;
const signin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const user = yield (0, userRepository_1.findUserByEmail)(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const userProfile = yield (0, userRepository_1.findUserProfileById)(user.id);
        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
        res.status(200).json({ message: 'Signed in successfully', user: { id: user.id, email: email, nickname: (userProfile === null || userProfile === void 0 ? void 0 : userProfile.nickname) || null, location: (userProfile === null || userProfile === void 0 ? void 0 : userProfile.location) || null, profileImage: (userProfile === null || userProfile === void 0 ? void 0 : userProfile.profile_image_url) || null }, token });
    }
    catch (error) {
        next(error);
    }
});
exports.signin = signin;
