"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateToken = (req, res, next) => {
    console.log('authenticateToken middleware entered for path:', req.path);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        console.log('Authentication token not provided.');
        return res.status(401).json({ message: 'Authentication token required' });
    }
    console.log('Token received (first 10 chars):', token.substring(0, 10), '...');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not defined in environment variables.');
        return res.status(500).json({ message: 'Server configuration error.' });
    }
    console.log('Attempting to verify token with JWT_SECRET (first 5 chars):', jwtSecret.substring(0, 5));
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            console.error('Full JWT error object:', err); // Log full error object
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        console.log('JWT verification successful for user ID:', user.id);
        req.userId = user.id;
        next();
    });
};
exports.authenticateToken = authenticateToken;
