import express from "express";
import asyncHandler from "express-async-handler";

import { Request, Response, NextFunction } from "express";

import fs from "fs/promises";
import { auth } from "@src/middleware/auth";
import { User } from "@src/domain/user/user"; // 모델 스키마 가져오기
import { Map } from "@src/domain/map/map";
import { Solution } from "@src/domain/solution/solution";
import { Counter } from "@src/domain/counter";
import { uploadImage, getUrl } from "@src/config/uploadImage";
import AppError from "@src/config/app-error";
import userService from "@src/domain/user/userService";

const router = express.Router();

interface CustomRequest extends Request {
    user?: any; // 사용자 정의 타입에 맞게 조정
    file?: any; // multer 파일 타입
}

// 회원가입
router.post(
    "/register",
    asyncHandler(async (req, res, next) => {
        const user = await userService.createUser(req.body);
        res.status(200).json({ success: true, user });
    })
);

// 로그인
router.post(
    "/login",
    asyncHandler(async (req, res, next) => {
        const { email, password } = req.body;
        const user = await userService.authenticateUser(email, password);
        res.cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, user: user });
    })
);

// 로그아웃
router.get(
    "/logout",
    auth,
    asyncHandler(async (req: CustomRequest, res: Response) => {
        await userService.logoutUser(req.body.userId);
        res.status(200).send({ success: true });
    })
);

// 계정 탈퇴
router.delete(
    "/",
    auth,
    asyncHandler(async (req: CustomRequest, res: Response) => {
        const userId = req.user?._id;
        await userService.deleteUser(userId);
        res.status(200).json({
            success: true,
            message: "User account has been successfully deleted.",
        });
    })
);

// 유저 리스트 가져오기
router.get(
    "/",
    auth,
    asyncHandler(async (req: CustomRequest, res: Response, next) => {
        const updatedUsers =
            await userService.getUsersWithUpdatedProfileImages();
        res.status(200).json({
            success: true,
            users: updatedUsers,
        });
    })
);

// 프로필 사진 저장
router.patch(
    "/profileImage",
    auth,
    uploadImage.single("profileImage"),
    asyncHandler(async (req: CustomRequest, res: Response) => {
        const userId = req.params.userId;
        const imageUrl = await userService.getUserProfileImageUrl(userId);
        res.status(200).send({ success: true, url: imageUrl });
    })
);

// 프로필 사진 가져오기
router.get(
    "/profileImageUrl/:userId",
    auth,
    asyncHandler(async (req, res) => {
        const userId = req.params.userId;
        const imageUrl = await userService.getUserProfileImageUrl(userId);
        res.status(200).send({ url: imageUrl });
    })
);

// 특정 유저 디테일 가져오기
// router.get(
//     "/:userId",
//     auth,
//     asyncHandler(async (req, res) => {
//         const userId = req.params.userId;
//         const a = await userService.getUserDetails(userId);
//         res.status(200).json({
//             success: true,
//             user: a.user,
//             imageUrl: a.imageUrl,
//             likedMaps: a.likedMaps,
//             likedSolutions: a.likedSolutions,
//             maps: a.maps,
//             solutions: a.solutions,
//         });
//     })
// );

export default router;
