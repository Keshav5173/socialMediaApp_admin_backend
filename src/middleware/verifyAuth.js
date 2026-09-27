import jwt from "jsonwebtoken";
import pool from "../db/index.js";

export const VerifyAuth = async (req, res, next)=>{
    try {
        const bearerToken = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null;

        const token = bearerToken || req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const findUser = await pool.query("SELECT id, name, email FROM admins WHERE id = $1 ", [decoded.id]);
        if(findUser.rows.length===0){
            return res.status(401).json({ message: "Not authorised" });
        }
        req.user = findUser.rows[0]; 
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}