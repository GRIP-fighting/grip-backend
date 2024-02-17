import express from "express";
import asyncHandler from "express-async-handler";

import { Request, Response } from "express";

import { auth } from "@src/middleware/auth";
import { uploadProfileImage } from "@src/config/uploadImage";
import userService from "@src/domain/user/user-service";
import AppError from "@src/config/app-error";
import { User } from "@src/domain/user/user";

const router = express.Router();

interface User {
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
        const newUser = new User(req.body);
        await userService.createUser(newUser);
        res.status(200).json({ success: true });
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
    asyncHandler(async (req: CustomRequest, res) => {
        const userId = req.user?.userId as Number;
        await userService.logout(userId);
        res.status(200).json({ success: true });
    })
);

// 계정 탈퇴
router.delete(
    "/",
    auth,
    asyncHandler(async (req: CustomRequest, res: Response) => {
        await userService.deleteUser(req.user, req.body.password);
        res.status(200).json({ success: true });
    })
);

// 유저 리스트 가져오기
router.get(
    "/",
    auth,
    asyncHandler(async (req: CustomRequest, res: Response) => {
        const userList = await userService.getUsersWithUpdatedProfileImages();
        res.status(200).json({
            success: true,
            userList: userList,
        });
    })
);

// 특정 유저 디테일 가져오기
router.get(
    "/:userId",
    auth,
    asyncHandler(async (req, res) => {
        const userId: any = req.params.userId;
        const { user, mapList, solutionList } =
            await userService.getUserDetails(userId);
        res.status(200).json({
            success: true,
            user: user,
            mapList: mapList,
            solutionList: solutionList,
        });
    })
);

// 프로필 사진 저장
router.patch(
    "/profileImage",
    auth,
    uploadProfileImage.single("profileImage"),
    asyncHandler(async (req: CustomRequest, res: Response) => {
        const user = req.user;
        const imageUrl = await userService.updateUserProfileImage(user as User);
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
        res.status(200).send({ success: true, url: imageUrl });
    })
);

export default router;
