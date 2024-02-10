import express from "express";
import authController from "@src/domain/auth/authController";
import userController from "@src/domain/user/userController";
import mapController from "@src/domain/map/mapController";
import solutionController from "@src/domain/solution/solutionController";
import errorHandler from "@src/middleware/errorhandler";

const router = express.Router();

router.use("/auth", authController);
router.use("/user", userController);
// router.use("/map", mapController);
// router.use("/solution", solutionController);

router.use(errorHandler);

export default router;
