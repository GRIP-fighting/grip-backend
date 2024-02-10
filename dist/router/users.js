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
const auth_1 = require("@src/middleware/auth");
const User_1 = require("@src/model/User"); // 모델 스키마 가져오기
const Map_1 = require("@src/model/Map");
const Solution_1 = require("@src/model/Solution");
const uploadImage_1 = require("@src/config/uploadImage");
const router = express_1.default.Router();
// 회원가입
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new User_1.User(req.body); // body parser를 이용해서 json 형식으로 정보를 가져온다.
    try {
        yield user.save();
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.json({ success: false, err: error });
    }
}));
// 로그인
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.User.findOne({ email: req.body.email });
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "이메일에 해당하는 유저가 없습니다.",
            });
        }
        const isMatch = yield user.comparePassword(req.body.password);
        if (!isMatch) {
            return res.json({
                loginSuccess: false,
                message: "비밀번호가 틀렸습니다.",
            });
        }
        const tokenUser = yield user.generateToken();
        tokenUser.profileImagePath = yield (0, uploadImage_1.getUrl)(tokenUser.profileImagePath);
        res.cookie("x_auth", tokenUser.token)
            .status(200)
            .json({ loginSuccess: true, user: tokenUser });
    }
    catch (err) {
        res.status(400).send(err);
    }
}));
// 로그아웃
router.get("/logout", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const updatedUser = yield User_1.User.findOneAndUpdate({ _id: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }, { token: "" });
        res.status(200).send({ success: true });
    }
    catch (err) {
        res.json({ success: false, err });
    }
}));
// 계정 탈퇴
router.delete("/", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        const deletedUser = yield User_1.User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }
        res.status(200).json({
            success: true,
            message: "User account has been successfully deleted.",
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}));
// 유저 리스트 가져오기
router.get("/", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.User.find({}).select("-password -token -__v");
        try {
            const updatedUsers = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
                user.profileImagePath = yield (0, uploadImage_1.getUrl)(user.profileImagePath);
                return user;
            })));
            return res.status(200).json({
                success: true,
                users: updatedUsers,
            });
        }
        catch (error) {
            console.error("Error updating users with signed URLs:", error);
            throw error;
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error });
    }
}));
// 프로필 사진 저장
router.patch("/profileImage", auth_1.auth, uploadImage_1.uploadImage.single("profileImage"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    console.log("users-profileImage-save");
    try {
        const imagePath = req.file.location.split("/").pop();
        user.profileImagePath = imagePath;
        yield user.save();
        res.status(200).send({
            success: true,
            user: user,
        });
    }
    catch (error) {
        res.status(500).send("An error occurred");
    }
}));
// 프로필 사진 가져오기
router.get("/profileImageUrl/:userId", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const user = yield User_1.User.findOne({ userId: userId });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "사용자를 찾을 수 없습니다.",
        });
    }
    try {
        const imageUrl = yield (0, uploadImage_1.getUrl)(user.profileImagePath); //IncomingMessage
        console.log(imageUrl);
        res.status(200).send({ url: imageUrl });
    }
    catch (error) {
        res.status(500).send("An error occurred");
    }
}));
// 특정 유저 디테일 가져오기
router.get("/:userId", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const user = yield User_1.User.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "사용자를 찾을 수 없습니다.",
            });
        }
        const imageData = yield (0, uploadImage_1.getUrl)(user.profileImagePath); //IncomingMessage
        const likedMaps = yield Map_1.Map.find({
            mapId: { $in: user.likedMapId || "" },
        });
        const likedSolutions = yield Solution_1.Solution.find({
            solutionId: { $in: user.likedSolutionId },
        });
        const maps = yield Map_1.Map.find({ mapId: { $in: user.mapId } });
        const solutions = yield Solution_1.Solution.find({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error });
    }
}));
exports.default = router;
