import { User } from "@src/domain/user/user"; // 모델 스키마 가져오기

import asyncHandler from "express-async-handler";
import AppError from "@src/config/app-error";

let auth = asyncHandler(async (req: any, res: any, next: any) => {
    let token = req.cookies.x_auth;

    // const user = await User.findOne({ userId: 1 });
    // req.user = user;
    // next();

    const user: any = User.findByToken(token);
    if (!user) throw new AppError(404, "인증불가");
    req.token = token;
    req.user = user;
    next();
});
export { auth };
