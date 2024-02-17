import express from "express";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { auth } from "@src/middleware/auth";
import { uploadMapImage } from "@src/config/uploadImage";
import { User } from "@src/domain/user/user"; // 모델 스키마 가져오기
import { Map } from "@src/domain/map/map";
import { Solution } from "@src/domain/solution/solution";

import AppError from "@src/config/app-error";
import mapService from "@src/domain/map/map-service";

const router = express.Router();

interface User {
    userId: Number;
    email: string;
}

interface CustomRequest extends Request {
    user?: User; // 사용자 정의 타입에 맞게 조정
}

// map 추가
router.post(
    "/",
    auth,
    uploadMapImage.single("mapImage"),
    asyncHandler(async (req, res) => {
        req.body.userList = JSON.parse(req.body.userList);
        const map: any = new Map(req.body);
        await map.save();
        res.status(200).json({ success: true });
    })
);

// 맵 리스트 가져오기
router.get(
    "/",
    auth,
    asyncHandler(async (req, res) => {
        const mapList = await Map.find({}).select("-__v");
        res.status(200).json({
            success: true,
            mapList: mapList,
        });
    })
);

// 특정 맵 디테일 가져오기
router.get(
    "/:mapId",
    auth,
    asyncHandler(async (req, res) => {
        const mapId = req.params.mapId;
        const map: any = await Map.findOne({ mapId: mapId });
        if (!map) throw new AppError(404, "맵을 찾을 수 없습니다");

        const userList = await User.find({ userId: { $in: map.userList } });
        const solutionList = await Solution.find({
            solutionId: { $in: map.solutionList },
        });
        res.status(200).json({
            success: true,
            userList: userList,
            solutionList: solutionList,
        });
    })
);

// 맵 삭제 - 자기 자신만
router.delete(
    "/:mapId",
    auth,
    asyncHandler(async (req: CustomRequest, res) => {
        const user: any = req.user;
        const mapId = req.params.mapId as unknown as Number;
        const mapIsDeleted = await mapService.deleteUserFromUserList(
            user,
            mapId
        );
        res.status(200).json({ success: true, mapIsDeleted: mapIsDeleted });
    })
);

// 맵 정보 수정
router.patch(
    "/:mapId",
    auth,
    asyncHandler(async (req, res) => {
        const mapId = req.params.mapId;
        const { mapName, userList } = req.body;
        await mapService.updateMap(mapId, mapName, JSON.parse(userList));
        res.status(200).send({
            success: true,
        });
    })
);

export default router;
