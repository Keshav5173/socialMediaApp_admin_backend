import "dotenv/config"
import express from "express";
import pool from "./src/db/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./src/routes/index.js";



const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use("/adminapi", router);

const port = process.env.PORT
app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})