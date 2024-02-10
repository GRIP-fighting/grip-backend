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
exports.auth = void 0;
const User_1 = require("@src/model/User"); // 모델 스키마 가져오기
let auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.cookies.x_auth;
    const user = yield User_1.User.findOne({ userId: 1 });
    req.user = user;
    next();
    // User.findByToken을 프로미스로 처리
    // User.findByToken(token)
    //     .then((user) => {
    //         if (!user) return res.json({ isAuth: false, error: true });
    //         req.token = token;
    //         req.user = user;
    //         next();
    //     })
    //     .catch((err) => {
    //         console.error(err);
    //         return res.status(400).json({ isAuth: false, error: true });
    //     });
});
exports.auth = auth;
