const express = require("express"); // express를 가져온다.
const app = express(); // express를 이용해서 app을 만들어준다.
var usersRouter = require("./router/users.js");
var mapsRouter = require("./router/maps.js");
var solutionsRouter = require("./router/solutions.js");

const port = 8000; // port 번호를 5000번으로 설정
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const config = require("./config/key.js"); // config 폴더에 있는 key.js를 가져온다.

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

const mongoose = require("mongoose");
mongoose.connect(config.mongoURI, {}).catch((err) => console.log(err));
// mongoose.set("debug", true);

app.use("/api/users", usersRouter);
app.use("/api/maps", mapsRouter);
app.use("/api/solutions", solutionsRouter);
