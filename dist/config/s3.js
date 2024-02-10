"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const key_1 = __importDefault(require("./key"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3 = new client_s3_1.S3Client({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: key_1.default.ID,
        secretAccessKey: key_1.default.SECRET,
    },
});
exports.default = s3;
