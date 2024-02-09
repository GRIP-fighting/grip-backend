import express from "express";
import authController from "./auth/authController";

const router = express.Router();

router.use("/auth", authController.routes());

export default router;
