import mongoose from "mongoose";
const counterSchema = new mongoose.Schema(
    {
        id: String, // counterId 필드 정의
        seq: Number, // counterNum 필드 정의
    },
    { collection: "counters", strict: false }
);
const Counter = mongoose.model("Counter", counterSchema);

export { Counter };
