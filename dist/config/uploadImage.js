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
exports.getUrl = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const s3_1 = __importDefault(require("@src/config/s3"));
const key_1 = __importDefault(require("@src/config/key")); // config 폴더에 있는 key.ts를 가져온다.
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uploadImage = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3_1.default,
        bucket: key_1.default.BUCKET_NAME,
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: function (req, file, callback) {
            const userId = req.user.userId;
            callback(null, `profile_${userId}`);
        },
    }),
});
exports.uploadImage = uploadImage;
const getUrl = (imageName) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Bucket: key_1.default.BUCKET_NAME,
        Key: imageName,
    };
    try {
        const command = new client_s3_1.GetObjectCommand(params);
        const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3_1.default, command, { expiresIn: 60 * 10 });
        return url;
    }
    catch (err) {
        console.log("Error getting presigned url from AWS S3", err);
        return null;
    }
});
exports.getUrl = getUrl;
