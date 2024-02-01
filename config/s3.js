const config = require("./key.js"); // config 폴더에 있는 key.js를 가져온다.

const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: config.ID,
        secretAccessKey: config.SECRET,
    },
});

module.exports = s3;
