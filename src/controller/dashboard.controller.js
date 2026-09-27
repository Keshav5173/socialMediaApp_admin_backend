import pool from "../db/index.js";

const winnersList = async(req, res)=>{
    try {
        const winnerData = await pool.query(`
            SELECT *
            FROM winner
            ORDER BY winnercategory, rank_in_category ASC
        `);

        if(winnerData.rows.length===0){
            return res.status(400).json({
                message: "failed to fetched data"
            })
        }

        return res.status(200).json({
            data: winnerData
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",

        })
    }
}


export {
    winnersList
};