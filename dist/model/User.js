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
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose")); // 몽구스를 가져온다.
const bcrypt_1 = __importDefault(require("bcrypt")); // 비밀번호를 암호화 시키기 위해
const saltRounds = 10; // salt를 몇 글자로 할지
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // 토큰을 생성하기 위해
// import { Schema } from "mongoose";
const Counter_1 = require("@src/model/Counter");
const userSchema = new mongoose_1.default.Schema({
    userId: {
        type: Number,
        unique: true,
    },
    name: {
        type: String,
        maxlength: 50,
    },
    email: {
        type: String,
        trim: true, // 스페이스를 없애주는 역할
        unique: 1, // 중복을 허용하지 않는다.
        index: true,
    },
    password: {
        type: String,
        minlength: 5,
    },
    profileImagePath: {
        type: String,
        default: "profile_0",
    },
    role: {
        type: Number,
        default: 0, // 0은 일반 유저, 1은 관리자
    },
    score: {
        type: Number,
        default: 0,
    },
    liked: {
        type: Number,
        default: 0,
    },
    likedMapId: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    likedSolutionId: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    mapId: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    solutionId: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    token: {
        type: String,
    },
});
// save하기 전에 비밀번호를 암호화 시킨다.
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        try {
            if (this.isNew) {
                const counter = yield Counter_1.Counter.findByIdAndUpdate({ _id: "userId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
                user.userId = counter.seq;
            }
            // 비밀번호 암호화
            if (user.isModified("password")) {
                const salt = yield bcrypt_1.default.genSalt(saltRounds);
                user.password = yield bcrypt_1.default.hash(user.password, salt);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// 토큰을 생성하는 메소드
userSchema.methods.generateToken = function () {
    const user = this;
    return new Promise((resolve, reject) => {
        // jsonwebtoken을 이용해서 token을 생성하기
        const token = jsonwebtoken_1.default.sign(user._id.toHexString(), "secretToken");
        user.token = token;
        user.save()
            .then((user) => {
            resolve(user);
        })
            .catch((err) => {
            reject(err);
        });
    });
};
userSchema.methods.comparePassword = function (plainPassword) {
    const user = this;
    return new Promise((resolve, reject) => {
        bcrypt_1.default.compare(plainPassword, user.password, function (err, isMatch) {
            if (err) {
                reject(err);
            }
            else {
                resolve(isMatch);
            }
        });
    });
};
// 토큰을 복호화하는 메소드
userSchema.statics.findByToken = function (token) {
    const user = this;
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, "secretToken", function (err, decoded) {
            if (err)
                return reject(err);
            user.findOne({ _id: decoded, token: token })
                .then((user) => {
                resolve(user);
            })
                .catch((err) => {
                reject(err);
            });
        });
    });
};
const User = mongoose_1.default.model("User", userSchema);
exports.User = User;
