const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3.js");
const config = require("./key.js"); // config 폴더에 있는 key.js를 가져온다.
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const uploadImage = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, callback) {
            const userId = req.user.userId;
            callback(null, `profile_${userId}`);
        },
    }),
});

const getImage = async (imageName) => {
    const params = {
        Bucket: config.BUCKET_NAME,
        Key: imageName,
    };
    try {
        const command = new GetObjectCommand(params);
        const data = await s3.send(command);
        return data.Body;
    } catch (error) {
        console.log("Error in getImage:", error);
        throw error;
    }
};

const getUrl = async (imageName) => {
    const params = {
        Bucket: config.BUCKET_NAME,
        Key: imageName,
    };

    try {
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 10 });
        return url;
    } catch (err) {
        console.log("Error getting presigned url from AWS S3", err);
        return null;
    }
};

module.exports = { uploadImage, getImage, getUrl };
