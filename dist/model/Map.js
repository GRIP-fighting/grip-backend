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
exports.Map = void 0;
const mongoose_1 = __importDefault(require("mongoose")); // 몽구스를 가져온다.
// const { Schema } = mongoose;
const User_1 = require("@src/model/User"); // 모델 스키마 가져오기
const Counter_1 = require("@src/model/Counter");
const mapSchema = new mongoose_1.default.Schema({
    mapId: {
        type: Number,
        unique: true,
    },
    mapName: {
        type: String,
        maxlength: 50,
    },
    mapPath: {
        type: String,
    },
    level: {
        type: Number,
        default: 0,
    },
    liked: {
        type: Number,
        default: 0,
    },
    likedUserId: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    designer: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    solutionId: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
});
mapSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const map = this;
        try {
            if (this.isNew) {
                const counter = yield Counter_1.Counter.findByIdAndUpdate({ _id: "mapId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
                map.mapId = counter.seq;
                try {
                    yield User_1.User.updateMany({ userId: { $in: map.designer } }, { $push: { mapId: map.mapId } });
                }
                catch (error) {
                    next(error);
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
mapSchema.statics.findDetailsByMapId = function (mapId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const map = yield this.findOne({ mapId: mapId });
            return map;
        }
        catch (error) {
            throw error;
        }
    });
};
const Map = mongoose_1.default.model("Map", mapSchema);
exports.Map = Map;
