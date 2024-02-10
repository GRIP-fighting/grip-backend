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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = require("@src/middleware/auth");
const User_1 = require("@src/model/User"); // 모델 스키마 가져오기
const Map_1 = require("@src/model/Map");
const Solution_1 = require("@src/model/Solution");
// map 추가
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const map = new Map_1.Map(req.body);
    try {
        yield map.save();
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.json({ success: false, err: error });
    }
}));
// 맵 리스트 가져오기
router.get("/", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const maps = yield Map_1.Map.find({}).select("-__v");
        return res.status(200).json({
            success: true,
            maps: maps,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error });
    }
}));
// 특정 맵 디테일 가져오기
router.get("/:mapId", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mapId = req.params.mapId;
        const map = yield Map_1.Map.findDetailsByMapId(mapId);
        if (!map) {
            return res.status(404).json({
                success: false,
                message: "맵을 찾을 수 없습니다.",
            });
        }
        const designer = yield User_1.User.find({ userId: { $in: map.designer } });
        const solutions = yield Solution_1.Solution.find({
            solutionId: { $in: map.solutionId },
        });
        res.status(200).json({
            success: true,
            designer: designer,
            solutions: solutions,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error });
    }
}));
// 맵 삭제 - 자기 자신만
router.delete("/:mapId/delete", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mapId = req.params.mapId;
        const map = yield Map_1.Map.findOne({ mapId: mapId });
        const userId = req.user.userId;
        const user = req.user;
        if (!map) {
            return res
                .status(404)
                .json({ success: false, message: "Map not found." });
        }
        if (map.designer.includes(userId)) {
            user.mapId = user.mapId.filter((myMapId) => myMapId !== mapId);
            yield user.save();
            map.designer = map.designer.filter((designerId) => designerId !== userId);
            if (map.designer.length === 0) {
                yield Map_1.Map.findByIdAndDelete(map._id);
                return res.status(200).json({
                    success: true,
                    message: "Map and user have been successfully deleted.",
                });
            }
            yield map.save();
            return res.status(200).json({
                success: true,
                message: "User has been successfully removed from the map.",
            });
        }
        else {
            return res.status(404).json({
                success: false,
                message: "User not found in the map.",
            });
        }
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}));
// 맵 좋아요
router.patch("/:mapId/liked", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const mapId = req.params.mapId;
    try {
        const map = yield Map_1.Map.findOne({ mapId: mapId });
        if (!user || !map) {
            return res.status(404).send("User or Map not found");
        }
        if (!user.likedMapId.includes(mapId)) {
            map.liked = map.liked + 1;
            map.likedUserId.push(user.userId);
            yield map.save();
            user.likedMapId.push(mapId);
            yield user.save();
        }
        else {
            map.liked = map.liked - 1;
            map.likedUserId.pull(user.userId);
            yield map.save();
            user.likedMapId.pull(mapId);
            yield user.save();
        }
        res.status(200).send({
            success: true,
            mapLikes: map.liked,
            userLikedMaps: user.likedMapId,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
}));
// 맵 정보 수정
router.patch("/:mapId", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const mapId = req.params.mapId;
    const { mapName, designer } = req.body;
    try {
        const validDesignerIds = yield User_1.User.find({
            _id: { $in: designer },
        }).select("_id");
        if (validDesignerIds.length !== designer.length) {
            return res.status(400).json({
                message: "잘못된 사용자 ObjectId가 포함되어 있습니다.",
            });
        }
        const map = yield Map_1.Map.findOne({ mapId: mapId });
        map.mapName = mapName;
        map.designer = designer;
        yield map.save();
        res.status(200).send({
            success: true,
            map: map,
        });
    }
    catch (error) {
        res.status(500).send("An error occurred");
    }
}));
exports.default = router;
