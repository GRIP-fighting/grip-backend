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
const Solution_1 = require("@src/model/Solution");
// solution 추가
router.post("/", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const solution = new Solution_1.Solution(req.body);
    const user = req.user;
    try {
        solution.userId = user.userId;
        yield solution.save();
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false, err: error });
    }
}));
// solution 추가
router.get("/", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const solutions = yield Solution_1.Solution.find({}).select("-__v");
        return res.status(200).json({
            success: true,
            solutions: solutions,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error });
    }
}));
// 솔루션 좋아요
router.patch("/:solutionId/liked", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const solutionId = req.params.solutionId;
    try {
        const solution = yield Solution_1.Solution.findOne({ solutionId: solutionId });
        if (!user || !solution) {
            return res.status(404).send("User or Map not found");
        }
        if (!user.likedSolutionId.includes(solutionId)) {
            solution.liked = solution.liked + 1;
            yield solution.save();
            user.likedSolutionId.push(solutionId);
            yield user.save();
        }
        else {
            solution.liked = solution.liked - 1;
            yield solution.save();
            user.likedSolutionId.pull(solutionId);
            yield user.save();
        }
        res.status(200).send({
            success: true,
            mapLikes: solution.liked,
            userLikedMaps: user.likedSolutionId,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
}));
// 맵 삭제 - 자기 자신만
router.delete("/:solutionId/delete", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const solutionId = req.params.solutionId;
        const solution = yield Solution_1.Solution.findOne({ solutionId: solutionId });
        const userId = req.user.userId;
        const user = req.user;
        if (!solution) {
            return res
                .status(404)
                .json({ success: false, message: "Solution not found." });
        }
        if (solution.userId != userId) {
            return res.status(404).json({
                success: false,
                message: "No Permission",
            });
        }
        yield Solution_1.Solution.findByIdAndDelete(solution._id);
        user.solutionId = user.solutionId.filter((mySolutionId) => mySolutionId !== solutionId);
        yield user.save();
        return res.status(200).json({
            success: true,
            message: "User has been successfully removed from the map.",
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}));
exports.default = router;
