var express = require("express");
var router = express.Router();
const fs = require("fs").promises;
const { auth } = require("../middleware/auth.js");
const { User } = require("../models/User.js"); // 모델 스키마 가져오기
const { Map } = require("../models/Map.js");
const { Solution } = require("../models/Solution.js");
const { Counter } = require("../models/Counter.js");
const { uploadImage, getImage, getUrl } = require("../config/uploadImage.js");

// 회원가입
router.post("/register", async (req, res) => {
    const user = new User(req.body); // body parser를 이용해서 json 형식으로 정보를 가져온다.
    try {
        await user.save();
        res.status(200).json({ success: true });
    } catch (error) {
        res.json({ success: false, err: error });
    }
});

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
router.get("/logout", auth, async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user._id },
            { token: "" }
        );
        res.status(200).send({ success: true });
    } catch (err) {
        res.json({ success: false, err });
    }
});

// 계정 탈퇴
router.delete("/", auth, async (req, res) => {
    try {
        const userId = req.user._id;
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
    } catch (err) {
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
        } catch (error) {
            console.error("Error updating users with signed URLs:", error);
            throw error;
        }
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

// 프로필 사진 저장
router.patch(
    "/profileImage",
    auth,
    uploadImage.single("profileImage"),
    async (req, res) => {
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

// 자신의 프로필 사진 가져오기
router.get("/profileImage", auth, async (req, res) => {
    const user = req.user;
    try {
        if (user.profileImagePath == "") {
            return res.status(404).send("profileImagePath not found");
        }
        const imageData = await getImage(user.profileImagePath); //IncomingMessage

        // 테스트용
        const filePath = "./test.jpeg";
        const saveBufferToFile = async (buffer) => {
            try {
                await fs.writeFile(filePath, buffer);
                console.log(`File saved to ${filePath}`);
            } catch (error) {
                console.error("Error writing file:", error);
            }
        };
        saveBufferToFile(imageData);

        // 전송용
        res.setHeader("Content-Type", "image/png");
        imageData.pipe(res);
    } catch (error) {
        res.status(500).send("An error occurred");
    }
});

// 프로필 사진 가져오기
router.get("/profileImage/:userId", auth, async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findOne({ userId: userId });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "사용자를 찾을 수 없습니다.",
        });
    }
    try {
        const imageData = await getImage(user.profileImagePath); //IncomingMessage
        res.setHeader("Content-Type", "image/png");
        imageData.pipe(res);
    } catch (error) {
        res.status(500).send("An error occurred");
    }
});

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
        const likedMaps = await Map.find({ mapId: { $in: user.likedMapId } });
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

module.exports = router;
