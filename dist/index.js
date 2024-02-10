"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
require("module-alias/register");
const users_1 = __importDefault(require("@src/router/users"));
// import mapsRouter from "./router/maps";
// import solutionsRouter from "./router/solutions";
const key_1 = __importDefault(require("@src/config/key"));
const app = (0, express_1.default)(); // express를 이용해서 app을 만들어준다.
const port = 8000; // port 번호를 5000번으로 설정
app.listen(port);
app.use(body_parser_1.default.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
}));
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use((0, cookie_parser_1.default)());
mongoose_1.default
    .connect(key_1.default.mongoURI || "mongodb://localhost:27017/grip", {})
    .catch((err) => console.log(err));
mongoose_1.default.set("debug", true);
app.use("/api/users", users_1.default);
// app.use("/api/maps", mapsRouter);
// app.use("/api/solutions", solutionsRouter);
