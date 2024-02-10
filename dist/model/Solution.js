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
exports.Solution = void 0;
const mongoose_1 = __importDefault(require("mongoose")); // 몽구스를 가져온다.
// const { Schema } = mongoose;
const Counter_1 = require("@src/model/Counter");
const User_1 = require("@src/model/User"); // 모델 스키마 가져오기
const Map_1 = require("@src/model/Map");
const solutionSchema = new mongoose_1.default.Schema({
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
solutionSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const solution = this;
        try {
            if (this.isNew) {
                const counter = yield Counter_1.Counter.findByIdAndUpdate({ _id: "solutionId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
                if (!counter) {
                    throw new Error("Counter를 생성하거나 업데이트할 수 없습니다.");
                }
                solution.solutionId = counter.seq;
                const user = yield User_1.User.findOne({ userId: solution.userId });
                if (!user) {
                    throw new Error("사용자를 찾을 수 없습니다.");
                }
                const map = yield Map_1.Map.findOne({ mapId: solution.mapId });
                if (!map) {
                    throw new Error("맵을 찾을 수 없습니다.");
                }
                user.solutionId.push(solution.solutionId);
                map.solutionId.push(solution.solutionId);
                yield user.save();
                yield map.save();
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
const Solution = mongoose_1.default.model("Solution", solutionSchema); // 스키마를 모델로 감싸준다.
exports.Solution = Solution;
