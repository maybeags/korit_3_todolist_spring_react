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
exports.updateUserProfileById = exports.findUserProfileById = exports.createUserProfile = exports.createUser = exports.findUserByEmail = void 0;
const db_1 = __importDefault(require("../db"));
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.execute('SELECT id, password_hash FROM users WHERE email = ?', [email]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
});
exports.findUserByEmail = findUserByEmail;
const createUser = (email, passwordHash) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);
    return result.insertId;
});
exports.createUser = createUser;
const createUserProfile = (userId, nickname, location) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.execute('INSERT INTO user_profiles (user_id, nickname, location) VALUES (?, ?, ?)', [userId, nickname, location]);
});
exports.createUserProfile = createUserProfile;
const findUserProfileById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.execute('SELECT u.email, up.nickname, up.location, up.profile_image_url FROM users u JOIN user_profiles up ON u.id = up.user_id WHERE u.id = ?', [userId]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
});
exports.findUserProfileById = findUserProfileById;
const updateUserProfileById = (userId, nickname, location, profileImage) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.execute('UPDATE user_profiles SET nickname = ?, location = ?, profile_image_url = ? WHERE user_id = ?', [nickname, location, profileImage, userId]);
});
exports.updateUserProfileById = updateUserProfileById;
