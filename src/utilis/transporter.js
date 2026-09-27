import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASS,
  },
});