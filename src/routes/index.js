import authRouter from "./user.routes.js";
import contestRouter from "./contest.routes.js";
import dashboardRouter from "./dashboard.routes.js"
import { Router } from "express";

const router = Router();

router.use("/user", authRouter);
router.use("/contest", contestRouter);
router.use("/dashboard", dashboardRouter);

export default router