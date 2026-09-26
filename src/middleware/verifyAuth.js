import jwt from "jsonwebtoken";
import pool from "../db/index.js";

export const VerifyAuth = async (req, res, next)=>{
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                message: "not authorised no token"
            })
        }

        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await pool.query('SELECT id, name, email FROM admins WHERE id = $1', [decodedToken.id]);

        if(user.rows.length===0){
            return res.status(401).json({
                message: "not authorised"
            })
        }
        req.user = user.rows[0];
        next();
    } catch (error) {
        console.log("verify auth failed: ", error);
        res.status(401).json({ message: "not authorised"});
    }
}