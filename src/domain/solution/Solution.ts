import mongoose from "mongoose"; // 몽구스를 가져온다.
import AutoIncrementFactory from "mongoose-sequence";
import { User } from "@src/domain/user/user"; // 모델 스키마 가져오기
import { Map } from "@src/domain/map/map";
import AppError from "@src/config/app-error";

interface IUser extends Document {
    liked: any;
    likedUserList: Number[];
}

const solutionSchema = new mongoose.Schema({
    solutionId: {
        type: Number,
        unique: true,
    },
    userId: {
        type: Number,
    },
    mapId: {
        type: Number,
    },
    evaluatedLevel: {
        type: Number,
        default: 0,
    },
    solutionPath: {
        type: String,
    },
    date: {
        type: Date,
    },
    liked: {
        type: Number,
        default: 0,
    },
    likedUserList: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
});

// @ts-ignore
const AutoIncrement = AutoIncrementFactory(mongoose);
// @ts-ignore
solutionSchema.plugin(AutoIncrement, { inc_field: "solutionId" });

solutionSchema.pre("save", async function (next) {
    const solution = this;
    const user = await User.findOne({ userId: solution.userId });
    if (!user) throw new AppError(404, "User not found");

    const map = await Map.findOne({ mapId: solution.mapId });
    if (!map) throw new AppError(404, "Map not found");

    // data 오늘 날짜로

    // solution path 경로 설정해서

    user.solutionList.push(solution.solutionId as Number);
    map.solutionList.push(solution.solutionId as Number);
    await user.save();
    await map.save();
    next();
});

const Solution = mongoose.model<IUser>("Solution", solutionSchema); // 스키마를 모델로 감싸준다.

export { Solution };
