const mongoose = require("mongoose"); // 몽구스를 가져온다.
const bcrypt = require("bcrypt"); // 비밀번호를 암호화 시키기 위해
const saltRounds = 10; // salt를 몇 글자로 할지
const jwt = require("jsonwebtoken"); // 토큰을 생성하기 위해
const Schema = mongoose.Schema;
const { Counter } = require("./Counter.js");

const userSchema = mongoose.Schema({
    userId: {
        type: Number,
        unique: true,
    },
    name: {
        type: String,
        maxlength: 50,
    },
    email: {
        type: String,
        trim: true, // 스페이스를 없애주는 역할
        unique: 1, // 중복을 허용하지 않는다.
        index: true,
    },
    password: {
        type: String,
        minlength: 5,
    },
    profileImagePath: {
        type: String,
        default: "profile_0",
    },
    role: {
        type: Number,
        default: 0, // 0은 일반 유저, 1은 관리자
    },
    score: {
        type: Number,
        default: 0,
    },
    liked: {
        type: Number,
        default: 0,
    },
    likedMapId: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    likedSolutionId: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    mapId: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    solutionId: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    token: {
        type: String,
    },
});

// save하기 전에 비밀번호를 암호화 시킨다.
userSchema.pre("save", async function (next) {
    const user = this;
    try {
        if (this.isNew) {
            const counter = await Counter.findByIdAndUpdate(
                { _id: "userId" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            user.userId = counter.seq;
        }
        // 비밀번호 암호화
        if (user.isModified("password")) {
            const salt = await bcrypt.genSalt(saltRounds);
            user.password = await bcrypt.hash(user.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});

// 토큰을 생성하는 메소드
userSchema.methods.generateToken = function () {
    const user = this;
    return new Promise((resolve, reject) => {
        // jsonwebtoken을 이용해서 token을 생성하기
        const token = jwt.sign(user._id.toHexString(), "secretToken");
        user.token = token;
        user.save()
            .then((user) => {
                resolve(user);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

userSchema.methods.comparePassword = function (plainPassword) {
    const user = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainPassword, user.password, function (err, isMatch) {
            if (err) {
                reject(err);
            } else {
                resolve(isMatch);
            }
        });
    });
};

// 토큰을 복호화하는 메소드
userSchema.statics.findByToken = function (token) {
    const user = this;
    return new Promise((resolve, reject) => {
        jwt.verify(token, "secretToken", function (err, decoded) {
            if (err) return reject(err);
            user.findOne({ _id: decoded, token: token })
                .then((user) => {
                    resolve(user);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    });
};

const User = mongoose.model("User", userSchema); // 스키마를 모델로 감싸준다.

module.exports = { User }; // 다른 곳에서도 사용할 수 있도록 export 해준다.
