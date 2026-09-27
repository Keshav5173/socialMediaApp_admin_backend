import jwt from "jsonwebtoken";
import pool from "../db/index.js";
import bcrypt from "bcrypt";

const cookieOptions = {
    httpOnly: true,
    sameSite: 'Strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
}

const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        {
            expiresIn: '30d'
        }
    );
};

const userRegister = async(req, res)=>{
    const {name, email, password} = req.body;

    try{

        if(!name || !email || !password){
            return res.status(400).json({
                message: "Please provide all data"
            })
        }
        const userExists = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

        if(userExists.rows.length>0){
            return res.status(400).json({
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const createdUser = await pool.query(
            'INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        const token = generateToken(createdUser.rows[0].id);

        res.cookie('token', token, cookieOptions);

        return res.status(200).json({
            message: "Succesfully registered user",
            data: createdUser.rows[0],
            sucess: true
        })
    }catch(err){
        console.log("Error occured while registering user", err);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}


const loginUser = async(req, res)=>{
    const { email, password } = req.body;

    try{
        if(!email || !password){
            return res.status(400).json({
                message: "Email and passowrd are required"
            });
        }

        const userExists = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

        if(userExists.rows.length===0){
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const userData = userExists.rows[0];
        const isMatch = await bcrypt.compare(password, userData.password);

        if(!isMatch){
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const token = generateToken(userData.id);

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            message: "User logged in sucessfully",
            data: {id: userData.id, name: userData.name, email: userData.email}
        });
    }catch(err){
        console.log("Error occured while logging in the user", err);
        return res.status(500).json({
            message: "Internal Server error",

        })
    }
}

const getUser = async(req, res)=>{
    console.log("viewProfile: ", req.user);
    return res.status(200).json({
        data: req.user
    })
}

const logoutUser = async (req, res) => {
    res.cookie('token', '', {
        ...cookieOptions,
        maxAge: 1
    });

    return res.status(200).json({
        message: "User logged out"
    });
};


export {
    userRegister,
    loginUser,
    getUser,
    logoutUser

};