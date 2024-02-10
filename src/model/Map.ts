import mongoose from "mongoose"; // 몽구스를 가져온다.
// const { Schema } = mongoose;
import { User } from "@src/model/User"; // 모델 스키마 가져오기
import { Counter } from "@src/model/Counter";

const mapSchema = new mongoose.Schema({
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

mapSchema.pre("save", async function (next) {
    const map = this;
    try {
        if (this.isNew) {
            const counter = await Counter.findByIdAndUpdate(
                { _id: "mapId" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            map.mapId = counter.seq;
            try {
                await User.updateMany(
                    { userId: { $in: map.designer } },
                    { $push: { mapId: map.mapId } }
                );
            } catch (error: any) {
                next(error);
            }
        }
        next();
    } catch (error: any) {
        next(error);
    }
});

mapSchema.statics.findDetailsByMapId = async function (mapId) {
    try {
        const map = await this.findOne({ mapId: mapId });
        return map;
    } catch (error) {
        throw error;
    }
};

const Map = mongoose.model("Map", mapSchema);

export { Map };
