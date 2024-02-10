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
exports.Counter = void 0;
const mongoose_1 = __importDefault(require("mongoose")); // 몽구스를 가져온다.
const saltRounds = 10; // salt를 몇 글자로 할지
// const { Schema } = "mongoose";
const counterSchema = new mongoose_1.default.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});
const Counter = mongoose_1.default.model("Counter", counterSchema);
exports.Counter = Counter;
// 이미 존재하는지 확인
function initializCounter() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userIdCounter = yield Counter.findById("userId");
            if (!userIdCounter) {
                const newUserIdCounter = new Counter({
                    _id: "userId",
                    seq: 0, // seq 값을 0으로 초기화
                });
                yield newUserIdCounter.save();
            }
            const mapIdCounter = yield Counter.findById("mapId");
            if (!mapIdCounter) {
                // 'mapId' 항목이 없다면 새로 생성
                const newMapIdCounter = new Counter({
                    _id: "mapId",
                    seq: 0, // seq 값을 0으로 초기화
                });
                yield newMapIdCounter.save();
            }
            const solutionIdCounter = yield Counter.findById("solutionId");
            if (!solutionIdCounter) {
                const newSolutionIdCounter = new Counter({
                    _id: "solutionId",
                    seq: 0, // seq 값을 0으로 초기화
                });
                yield newSolutionIdCounter.save();
            }
        }
        catch (error) {
            console.error("Error initializing counter:", error);
        }
    });
}
