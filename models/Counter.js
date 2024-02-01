const mongoose = require("mongoose"); // 몽구스를 가져온다.
const bcrypt = require("bcrypt"); // 비밀번호를 암호화 시키기 위해
const saltRounds = 10; // salt를 몇 글자로 할지
const jwt = require("jsonwebtoken"); // 토큰을 생성하기 위해
const Schema = mongoose.Schema;

const counterSchema = mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

module.exports = { Counter }; // 다른 곳에서도 사용할 수 있도록 export 해준다.

// 이미 존재하는지 확인
async function initializCounter() {
    try {
        const userIdCounter = await Counter.findById("userId");
        if (!userIdCounter) {
            const newUserIdCounter = new Counter({
                _id: "userId",
                seq: 0, // seq 값을 0으로 초기화
            });
            await newUserIdCounter.save();
        }
        const mapIdCounter = await Counter.findById("mapId");
        if (!mapIdCounter) {
            // 'mapId' 항목이 없다면 새로 생성
            const newMapIdCounter = new Counter({
                _id: "mapId",
                seq: 0, // seq 값을 0으로 초기화
            });
            await newMapIdCounter.save();
        }
        const solutionIdCounter = await Counter.findById("solutionId");
        if (!solutionIdCounter) {
            const newSolutionIdCounter = new Counter({
                _id: "solutionId",
                seq: 0, // seq 값을 0으로 초기화
            });
            await newSolutionIdCounter.save();
        }
    } catch (error) {
        console.error("Error initializing counter:", error);
    }
}
initializCounter();
