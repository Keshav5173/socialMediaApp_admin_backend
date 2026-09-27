import axios from "axios";
import pool from "../db/index.js";
import { transporter } from "../utilis/transporter.js";

const getTopCreater = async (req, res) => {
    try {
        const topCreater = await axios.get(
            "http://65.2.69.203:3000/api/contest/most-active-contributer"
        );

        if (
            !topCreater.data ||
            !Array.isArray(topCreater.data.data)
        ) {
            return res.status(400).json({
                message: "Unable to fetch API"
            });
        }

        const savedWinners= await Promise.all(
            topCreater.data.data.map((user, index) => {
                return pool.query(
                    `INSERT INTO winner 
                    (winnername, winneremail, winnercategory, kycstatus, rank_in_category)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *`,
                    [
                        user.fullName,
                        user.email,
                        "Top Active Contributer",
                        "PENDING",
                        index + 1
                    ]
                );
            })
        );

        return res.status(200).json({
            message: "Fetched and winners inserted successfully",
            data: savedWinners
        });

    } catch (error) {
        console.log("Error at getTopCreater:", error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


const sendEmailToWinners = async (req, res) => {
    

    const results = {
        sent: [],
        failed: []
    };

    try {
        // Check SMTP connection
        await transporter.verify();
        console.log("SMTP server is ready");

        // Get all winners
        const winners = await pool.query(
            "SELECT * FROM winner ORDER BY rank_in_category ASC"
        );

        if (winners.rows.length === 0) {
            return res.status(404).json({
                message: "No winners found"
            });
        }

        // Send email to every winner
        for (let i = 0; i < winners.rows.length; i++) {
            const winner = winners.rows[i];

            const emailSubject = "Congratulations! You Won | Emilo Ventures";

            const emailBody = `
Dear ${winner.winnername},

Congratulations! 🎉

We are glad to announce that you have won the contest at Emilo Ventures.

Category: ${winner.winnercategory}
Rank: ${winner.rank_in_category}

Please fill out the KYC form to proceed with the verification process.

Thank you for participating in the contest.

Regards,
Emilo Ventures`;

            try {
                await transporter.sendMail({
                    from: `"Keshav Bhardwaj" <${process.env.SMTP_USER}>`,
                    to: winner.winneremail,
                    subject: emailSubject,
                    text: emailBody
                });

                console.log(`Email sent to ${winner.winneremail}`);

                results.sent.push({
                    email: winner.winneremail,
                    name: winner.winnername
                });

            } catch (err) {
                console.error(
                    `Failed to send email to ${winner.winneremail}:`,
                    err.message
                );

                results.failed.push({
                    email: winner.winneremail,
                    name: winner.winnername,
                    error: err.message
                });
            }
        }

        return res.status(200).json({
            message: "Winner email process completed",
            totalWinners: winners.rows.length,
            totalSent: results.sent.length,
            totalFailed: results.failed.length,
            sent: results.sent,
            failed: results.failed
        });

    } catch (error) {
        console.error("Error in sendEmailToWinners:", error);

        return res.status(500).json({
            message: "Failed to send winner emails",
            error: error.message
        });
    }
};


export {
    getTopCreater,
    sendEmailToWinners
};