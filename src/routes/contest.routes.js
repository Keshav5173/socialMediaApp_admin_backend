import { getTopCreater, sendEmailToWinners } from "../controller/contest.controller.js";
import { Router } from "express";


const router = Router();


router.get("/getContent", getTopCreater);
router.post("/sendEmail", sendEmailToWinners);


export default router;