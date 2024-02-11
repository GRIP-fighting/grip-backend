import mongoose from "mongoose"; // 몽구스를 가져온다.
// const { Schema } = mongoose;
import AutoIncrement from "mongoose-sequence";

import { User } from "@src/domain/user/user"; // 모델 스키마 가져오기
import { Map } from "@src/domain/map/map";
const solutionSchema = new mongoose.Schema({
    solutionId: {
        type: Number,
        unique: true,
    },
    userId: {
        type: Number, // 또는 Integer로 변경
    },
    mapId: {
        type: Number, // 또는 Integer로 변경
    },
    liked: {
        type: Number,
        default: 0,
    },
    evaluatedLevel: {
        type: Number,
        default: 0,
    },
    solutionPath: {
        type: String,
    },
});

solutionSchema.plugin(AutoIncrement, { inc_field: "solutionId" });

solutionSchema.pre("save", async function (next) {
    const solution = this;
    try {
        if (this.isNew) {
            const user = await User.findOne({ userId: solution.userId });
            if (!user) {
                throw new Error("사용자를 찾을 수 없습니다.");
            }

            const map = await Map.findOne({ mapId: solution.mapId });
            if (!map) {
                throw new Error("맵을 찾을 수 없습니다.");
            }

            user.solutionId.push(solution.solutionId);
            map.solutionId.push(solution.solutionId);
            await user.save();
            await map.save();
        }
        next();
    } catch (error: any) {
        next(error);
    }
});

const Solution = mongoose.model("Solution", solutionSchema); // 스키마를 모델로 감싸준다.

export { Solution };
