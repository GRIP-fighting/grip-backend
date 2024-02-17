import mongoose from "mongoose"; // 몽구스를 가져온다.
import AutoIncrementFactory from "mongoose-sequence";

import { User } from "@src/domain/user/user";
import { Counter } from "@src/domain/counter/counter"; // 모델 스키마 가져오기

interface IUser extends Document {
    solutionList: Number[];
}

const mapSchema: mongoose.Schema = new mongoose.Schema({
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
    userList: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    solutionList: [
        {
            type: Number, // 또는 Integer로 변경
        },
    ],
    gymId: {
        type: String,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
});

// @ts-ignore
const AutoIncrement = AutoIncrementFactory(mongoose);
// @ts-ignore
mapSchema.plugin(AutoIncrement, { inc_field: "mapId" });

mapSchema.pre("save", async function (next) {
    const map = this;

    const mapCounter: any = await Counter.findOne({ id: "mapId" }, { seq: 1 });
    let mapId = 1;
    if (mapCounter) mapId += mapCounter.seq;

    await User.updateMany(
        { userId: { $in: map.userList } },
        { $push: { mapList: mapId } }
    );
    next();
});

const Map = mongoose.model<IUser>("Map", mapSchema);

export { Map };
