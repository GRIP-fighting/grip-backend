import dotenv from "dotenv";
dotenv.config();

const config = {
    mongoURI: process.env.MONGO_URI,
    ID: process.env.ID,
    SECRET: process.env.SECRET,
    BUCKET_NAME: process.env.BUCKET_NAME,
};

export default config;
