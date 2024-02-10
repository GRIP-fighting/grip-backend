"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    mongoURI: process.env.MONGO_URI,
    ID: process.env.ID,
    SECRET: process.env.SECRET,
    BUCKET_NAME: process.env.BUCKET_NAME,
};
exports.default = config;
