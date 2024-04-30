const express = require("express");
const db = require("../database.js");
const bcrypt = require("bcrypt");
const router = express.Router();
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const nodemailer = require("nodemailer");
const mailPassword = process.env.MAIL_PASSWORD;
const mailUser = process.env.MAIL_USER;
require('dotenv').config();
const otpMail = require("../utils/otpMail.js");

function generateOtp() {
  const digits = '1234567890';
  let otp = ''
  for (i = 0; i < 4; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp
}

router.post("/generate-forgot-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await db.query("select * from users where email=$1", [email]);
    if (result.rows.length > 0) {
      const otp = generateOtp();
      const mailHtml = otpMail(otp, email)
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
        data: jwtSecret + email
      }, otp, { expiresIn: '5m' });
      res.json({ success: true, token })
    }
    else {
      return res.json({ success: false, error: "User doesn't exists!" });
    }
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
});

router.post("/check-otp", async (req, res) => {
  try {
    const { email, token, otp } = req.body;
    const decoded = await jwt.verify(token, otp);
    const data = decoded.data;
    const secretLen = jwtSecret.length;
    const retrievedEmail = data.slice(secretLen);
    if (retrievedEmail !== email) {
      return res.json({ success: false, error: "You're not authorised" });
    } else {
      return res.json({ success: true, error: "nothing" });
    }
  } catch (error) {
    if (error.message === 'invalid signature') {
      return res.json({ success: false, error: 'Incorrect OTP' })
    }
    else if (error.message === 'jwt expired') {
      return res.json({ success: false, error: 'OTP expired' });
    } else {
      return res.json({ success: false, error: error.message });
    }
  }
})

router.post("/set-password", async (req, res) => {
  try {
    const { password, email, token, otp } = req.body;
    const decoded = await jwt.verify(token, otp);
    const data = decoded.data;
    const secretLen = jwtSecret.length;
    const retrievedEmail = data.slice(secretLen);

    if (retrievedEmail !== email) {
      return res.json({ success: false, error: "Incorrect OTP" });
    }
    else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
          res.json({ success: false, error: err.message });
        } else {
          await db.query("update users set password=$1 where email=$2", [hash, email,]);
          res.json({ success: true, error: "nothing" });
        }
      });
    }
  }
  catch (error) {
    if (error.message === 'invalid signature') {
      return res.json({ success: false, error: 'Incorrect OTP' })
    }
    else if (error.message === 'jwt expired') {
      return res.json({ success: false, error: 'OTP expired' });
    } else {
      return res.json({ success: false, error: error.message });
    }
  }
});
module.exports = router;