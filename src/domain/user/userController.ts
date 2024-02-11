import express from "express";
import asyncHandler from "express-async-handler";

import { Request, Response } from "express";

import { auth } from "@src/middleware/auth";
import { uploadImage } from "@src/config/uploadImage";
import userService from "@src/domain/user/userService";
import AppError from "@src/config/app-error";

const router = express.Router();

interface User {
    _id: Number;
    userId: Number;
    email: string;
    // 사용자 정의 타입에 필요한 추가 속성들...
}

interface CustomRequest extends Request {
    user?: User; // 사용자 정의 타입에 맞게 조정
}

// 회원가입
router.post(
    "/register",
    asyncHandler(async (req, res) => {
        const user = await userService.createUser(req.body);
        res.status(200).json({ success: true, user });
    })
);

// 로그인
router.post(
    "/login",
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const user = await userService.login(email, password);
        res.cookie("x_auth", user.token)
            .status(200)
            .json({ success: true, user: user });
    })
);

// 로그아웃
router.get(
    "/logout",
    auth,
    asyncHandler(async (req, res) => {
        await userService.logoutUser(req.body.userId);
        res.status(200).json({ success: true });
    })
);

// 계정 탈퇴
router.delete(
    "/",
    auth,
    asyncHandler(async (req: CustomRequest, res: Response) => {
        const userId = req.user?._id;
        if (!userId) throw new AppError(404, "Wrong Input");
        await userService.deleteUser(userId);
        res.status(200).json({ success: true });
    })
);

// 유저 리스트 가져오기
router.get(
    "/",
    auth,
    asyncHandler(async (req: CustomRequest, res: Response) => {
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
        const userId = req.user?.userId as Number;
        const imageUrl = await userService.getUserProfileImageUrl(userId);
        res.status(200).send({ success: true, url: imageUrl });
    })
);

// 프로필 사진 가져오기
router.get(
    "/profileImageUrl/:userId",
    auth,
    asyncHandler(async (req, res) => {
        const userId = req.params.userId as unknown as Number;
        const imageUrl = await userService.getUserProfileImageUrl(userId);
        res.status(200).send({ success: true, url: imageUrl });
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
