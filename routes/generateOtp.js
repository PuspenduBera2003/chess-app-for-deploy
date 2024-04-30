const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken')
const db = require("../database.js");
const otpMail = require("../utils/otpMail.js");
const mailPassword = process.env.MAIL_PASSWORD;
const jwtSecret = process.env.JWT_SECRET;
const mailUser = process.env.MAIL_USER;
require('dotenv').config();

function generateOtp() {
    const digits = '1234567890';
    let otp = ''
    for (i = 0; i < 4; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp
}

router.post("/generate-otp", async (req, res) => {
    const { email, username } = req.body;
    try {
        const checkResult = await db.query("SELECT * FROM users WHERE username=$1 or email = $2", [
            username, email
        ]);
        if (checkResult.rows.length > 0) {
            if (checkResult.rows.length == 1) {
                if (checkResult.rows[0].email == email && checkResult.rows[0].username == username)
                    res.json({ error: "This User already exists, try with Login instead!", success: false });
                else if (checkResult.rows[0].email == email) {
                    res.json({ error: "This email is already taken, try with another email instead!", success: false });
                }
                else {
                    res.json({ error: "This username is already taken, try with another username instead!", success: false });
                }
            }
            else if (checkResult.rows.length > 1) {
                res.json({ error: "This User already exists, try with Login instead!", success: false });
            }
        }
        else {
            const otp = generateOtp();
            const mailHtml = otpMail(otp, username)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: mailUser,
                    pass: mailPassword,
                },
            });
            // send mail with defined transport object
            await transporter.sendMail({
                from: `"CHESSHUB AUTHENTICATION ♟️" <${mailUser}>`, // sender address
                to: email, // list of receivers
                subject: "Your One Time Password (OTP)", // Subject line
                html: mailHtml
            });
            const token = jwt.sign({
                data: jwtSecret + username
            }, otp, { expiresIn: '5m' });
            res.json({ success: true, token })
        }
    } catch (error) {
        console.error(error)
        res.json({ success: false, error: error.message })
    }
});

module.exports = router;