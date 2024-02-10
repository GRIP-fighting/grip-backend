import config from "./key";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: config.ID as string,
        secretAccessKey: config.SECRET as string,
    },
});

export default s3;
