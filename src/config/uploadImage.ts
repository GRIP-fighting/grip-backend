import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "@src/config/s3";
import config from "@src/config/key"; // config 폴더에 있는 key.ts를 가져온다.
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const uploadProfileImage = multer({
    storage: multerS3({
        s3: s3 as S3Client,
        bucket: config.BUCKET_NAME as string,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req: any, file: any, callback: any) {
            const userId = req.user.userId;
            callback(null, `profile_${userId}`);
        },
    }),
});

const uploadMapImage = multer({
    storage: multerS3({
        s3: s3 as S3Client,
        bucket: config.BUCKET_NAME as string,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req: any, file: any, callback: any) {
            callback(null, `map_${req.mapCounter}`);
        },
    }),
});

const uploadSolutionImage = multer({
    storage: multerS3({
        s3: s3 as S3Client,
        bucket: config.BUCKET_NAME as string,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req: any, file: any, callback: any) {
            callback(null, `map_${req.solutionCounter}`);
        },
    }),
});

const getUrl = async (imageName: string) => {
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

export { uploadProfileImage, uploadMapImage, getUrl };
