import authRouter from "./user.routes.js";
import { Router } from "express";

const router = Router();

router.use("/user", authRouter);


export default router