const express = require("express");
const db = require("../database.js");
const bcrypt = require("bcrypt");
const router = express.Router();
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const welcomeMail = require("../utils/welcomeMail.js");
const mailPassword = process.env.MAIL_PASSWORD;
const jwtSecret = process.env.JWT_SECRET;
const mailUser = process.env.MAIL_USER;
const nodemailer = require("nodemailer");
require('dotenv').config();

router.post("/register", async (req, res) => {

  const { username, email, password, otp, token } = req.body;

  try {
    const decoded = await jwt.verify(token, otp);
    const data = decoded.data;
    const secretLen = jwtSecret.length;
    const retrievedUsername = data.slice(secretLen);

    if (retrievedUsername !== username) {
      return res.json({ success: false, error: "You're not authorised" });
    }

    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);


    if (checkResult.rows.length > 0) {
      res.json({ error: "This Username is taken, try with another.", success: false });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
          res.json({ success: false, error: err });
        } else {
          const result = await db.query(
            "INSERT INTO users (username,email, password) VALUES ($1, $2,$3) RETURNING *",
            [username, email, hash]
          );
          const user = result.rows[0];
          const mailHtml = welcomeMail(username)
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: mailUser,
              pass: mailPassword,
            },
          });
          // send mail with defined transport object
          await transporter.sendMail({
            from: `"CHESSHUB ONBOARDING ♟️" <${mailUser}>`, // sender address
            to: email, // list of receivers
            subject: "Welcome to ChessHub! Let's Start Playing Chess 🏁", // Subject line
            html: mailHtml
          });
          req.login(user, (err) => {
            if (err) res.json({ success: false, error: "Server error" });
            else {
              res.json({ success: true, error: "nothing" });
            }
          });
        }
      });
    }
  } catch (err) {
    if (err.message === "invalid signature") {
      return res.json({ success: false, error: 'Wrong OTP' })
    } else if (err.message === "jwt expired") {
      return res.json({ success: false, error: 'OTP Expired' })
    }
    res.json({ success: false, error: err.message });
  }
});
module.exports = router;