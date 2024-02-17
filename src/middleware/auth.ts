import { User } from "@src/domain/user/user"; // 모델 스키마 가져오기
import { Counter } from "@src/domain/counter/counter"; // 모델 스키마 가져오기

import asyncHandler from "express-async-handler";
import AppError from "@src/config/app-error";

let auth = asyncHandler(async (req: any, res: any, next: any) => {
    let token = req.cookies.x_auth;

    // const user = await User.findOne({ userId: 1 });
    // req.user = user;
    // next();

    const user: any = await User.findByToken(token);
    if (!user) throw new AppError(404, "인증불가");
    req.token = token;
    req.user = user;

    const mapCounter: any = await Counter.findOne({ id: "mapId" }, { seq: 1 });
    if (!mapCounter) req.mapCounter = 1;
    else req.mapCounter = mapCounter.seq + 1;

    const solutionCounter: any = await Counter.findOne(
        { id: "solutionId" },
        { seq: 1 }
    );
    if (!solutionCounter) req.solutionCounter = 1;
    else req.solutionCounter = solutionCounter.seq + 1;

    await next();
});
export { auth };
