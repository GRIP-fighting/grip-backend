import "module-alias/register";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import router from "@src/domain/router";
import config from "@src/config/key";

const app = express(); // express를 이용해서 app을 만들어준다.
const port = 8000; // port 번호를 5000번으로 설정
app.listen(port);

app.use(
    bodyParser.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000,
    })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());

mongoose
    .connect(config.mongoURI || "mongodb://localhost:27017/grip", {})
    .catch((err: any) => console.log(err));
mongoose.set("debug", true);

app.use("/api", router);
