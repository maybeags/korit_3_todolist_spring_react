"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getEnvVar = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not set.`);
    }
    return value;
};
exports.env = {
    PORT: getEnvVar('PORT'),
    DB_HOST: getEnvVar('DB_HOST'),
    DB_PORT: parseInt(getEnvVar('DB_PORT'), 10),
    DB_USER: getEnvVar('DB_USER'),
    DB_PASSWORD: getEnvVar('DB_PASSWORD'),
    DB_DATABASE: getEnvVar('DB_DATABASE'),
    JWT_SECRET: getEnvVar('JWT_SECRET'),
};
