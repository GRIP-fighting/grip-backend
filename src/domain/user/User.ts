import mongoose from "mongoose";
import { Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import AutoIncrementFactory from "mongoose-sequence";
import jwt from "jsonwebtoken";
import AppError from "@src/config/app-error";

const saltRounds = 10;

interface IUserDocument extends Document {
    profileImagePath?: any;
    token?: any;

    comparePassword: (candidatePassword: string) => Promise<boolean>;
    generateToken: () => Promise<any>;
    mapList: Number[];
    solutionList: Number[];
}
interface IUserModel extends Model<IUserDocument> {
    findByToken: (token: any) => Promise<IUserDocument | null>;
}

const userSchema: mongoose.Schema = new mongoose.Schema({
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
    mapList: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    solutionList: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    token: {
        type: String,
    },
});

// @ts-ignore
const AutoIncrement = AutoIncrementFactory(mongoose);
// @ts-ignore
userSchema.plugin(AutoIncrement, { inc_field: "userId" });

// save하기 전에 비밀번호를 암호화 시킨다.
userSchema.pre("save", async function (next) {
    const user = this;
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(user.password as string, salt);
    next();
});

// 토큰을 생성하는 메소드
userSchema.methods.generateToken = async function () {
    const user = this;
    const token = jwt.sign(user._id.toHexString(), "secretToken");
    if (!token) throw new AppError(400, "토큰 생성 오류");
    user.token = token;
    await user.save();
    return user;
};

userSchema.methods.comparePassword = async function (plainPassword: any) {
    const user = this;
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    return isMatch;
};

// 토큰을 복호화하는 메소드
userSchema.statics.findByToken = function (token: any) {
    // const user = this;
    const decoded: any = jwt.verify(token, "secretToken");
    const newUser = this.findOne({ _id: decoded, token: token });
    return newUser;
    // return User.findOne({ _id: decoded, token: token }).exec(); // Promise를 반환하도록 수정
};

const User = mongoose.model<IUserDocument, IUserModel>("User", userSchema);

export { User };
