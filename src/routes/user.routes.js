import express from "express";
import { VerifyAuth } from "../middleware/verifyAuth.js";
import { getUser, loginUser, logoutUser, userRegister } from "../controller/user.controller.js";

const router = express.Router();


router.post("/register", userRegister);
router.post("/login", loginUser);
router.get("/viewprofile", VerifyAuth, getUser);
router.post("/logout", VerifyAuth, logoutUser);

export default router;