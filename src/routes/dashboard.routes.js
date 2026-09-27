
import { Router } from "express";
import { winnersList } from "../controller/dashboard.controller.js";
import { VerifyAuth } from "../middleware/verifyAuth.js";


const router = Router();


router.get("/getWinnersList", VerifyAuth, winnersList);


export default router;