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
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "이메일에 해당하는 유저가 없습니다.",
            });
        }
        const isMatch = await user.comparePassword(req.body.password);

        if (!isMatch) {
            return res.json({
                loginSuccess: false,
                message: "비밀번호가 틀렸습니다.",
            });
        }

        const tokenUser = await user.generateToken();
        tokenUser.profileImagePath = await getUrl(tokenUser.profileImagePath);

        res.cookie("x_auth", tokenUser.token)
            .status(200)
            .json({ loginSuccess: true, user: tokenUser });
    } catch (err) {
        res.status(400).send(err);
    }
});

// 로그아웃
router.get("/logout", auth, async (req: CustomRequest, res: Response) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user?._id },
            { token: "" }
        );
        res.status(200).send({ success: true });
    } catch (err: any) {
        res.json({ success: false, err });
    }
});

// 계정 탈퇴
router.delete("/", auth, async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }
        res.status(200).json({
            success: true,
            message: "User account has been successfully deleted.",
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 유저 리스트 가져오기
router.get("/", auth, async (req, res) => {
    try {
        const users = await User.find({}).select("-password -token -__v");

        try {
            const updatedUsers = await Promise.all(
                users.map(async (user) => {
                    user.profileImagePath = await getUrl(user.profileImagePath);
                    return user;
                })
            );
            return res.status(200).json({
                success: true,
                users: updatedUsers,
            });
        } catch (error: any) {
            console.error("Error updating users with signed URLs:", error);
            throw error;
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error });
    }
});

// 프로필 사진 저장
router.patch(
    "/profileImage",
    auth,
    uploadImage.single("profileImage"),
    async (req: CustomRequest, res: Response) => {
        const user = req.user;
        console.log("users-profileImage-save");
        try {
            const imagePath = req.file.location.split("/").pop();
            user.profileImagePath = imagePath;
            await user.save();
            res.status(200).send({
                success: true,
                user: user,
            });
        } catch (error) {
            res.status(500).send("An error occurred");
        }
    }
);

// 프로필 사진 가져오기
router.get("/profileImageUrl/:userId", auth, async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findOne({ userId: userId });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "사용자를 찾을 수 없습니다.",
        });
    }
    try {
        const imageUrl = await getUrl(user.profileImagePath); //IncomingMessage
        console.log(imageUrl);
        res.status(200).send({ url: imageUrl });
    } catch (error) {
        res.status(500).send("An error occurred");
    }
});

// 특정 유저 디테일 가져오기
router.get("/:userId", auth, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "사용자를 찾을 수 없습니다.",
            });
        }
        const imageData = await getUrl(user.profileImagePath); //IncomingMessage
        const likedMaps = await Map.find({
            mapId: { $in: user.likedMapId || "" },
        });
        const likedSolutions = await Solution.find({
            solutionId: { $in: user.likedSolutionId },
        });
        const maps = await Map.find({ mapId: { $in: user.mapId } });
        const solutions = await Solution.find({
            solutionId: { $in: user.solutionId },
        });
        res.status(200).json({
            success: true,
            user: user,
            imageUrl: imageData,
            likedMaps: likedMaps,
            likedSolutions: likedSolutions,
            maps: maps,
            solutions: solutions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error });
    }
});

export default router;
