import express from "express";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { auth } from "@src/middleware/auth";
import { User } from "@src/domain/user/user"; // 모델 스키마 가져오기
import { Map } from "@src/domain/map/map";
import { Solution } from "@src/domain/solution/solution";

import AppError from "@src/config/app-error";
import solutionService from "@src/domain/solution/solution-service";

const router = express.Router();

interface User {
    userId: Number;
    email: string;
}

interface CustomRequest extends Request {
    user?: User; // 사용자 정의 타입에 맞게 조정
}
// solution 추가
router.post(
    "/",
    auth,
    asyncHandler(async (req: CustomRequest, res) => {
        const solution: any = new Solution(req.body);
        const user: any = req.user;
        solution.userId = user.userId;
        await solution.save();
        res.json({ success: true });
    })
);

// solution 추가
router.get(
    "/",
    auth,
    asyncHandler(async (req, res) => {
        const solutions = await Solution.find({}).select("-__v");
        res.status(200).json({
            success: true,
            solutions: solutions,
        });
    })
);

// 솔루션 좋아요
router.patch(
    "/:solutionId/liked",
    auth,
    asyncHandler(async (req: CustomRequest, res) => {
        const user = req.user;
        const solutionId = req.params.solutionId;
        await solutionService.likeSolution(user, solutionId);
        res.status(200).send({
            success: true,
        });
    })
);

router.delete(
    "/:solutionId/delete",
    auth,
    asyncHandler(async (req: CustomRequest, res) => {
        const user: any = req.user;
        const solutionId = req.params.solutionId;
        await solutionService.deleteSolution(user, solutionId);
        res.status(200).json({
            success: true,
        });
    })
);

export default router;
