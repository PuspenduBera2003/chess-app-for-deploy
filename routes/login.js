const express = require("express");
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const router = express.Router();
const db = require("../database.js");
const bcrypt = require("bcrypt");
let success = false;
let error;
router.get("/login/status", (req, res) => {
  res.json({ success, error })
});

router.post("/login",
  passport.authenticate("local", {
    successRedirect: "login/status",
    failureRedirect: "login/status",
  })
);

passport.use(
  new Strategy(async function verify(email, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        email,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            //Error with password check
            console.error("Error comparing passwords:", err);
            error = "Server error";
            return cb(err);
          } else {
            if (valid) {
              //Passed password check
              error = "nothing";
              success = true;
              return cb(null, user);
            } else {
              //Did not pass password check
              error = "Wrong password!";
              success = false;
              return cb(null, false);
            }
          }
        });
      } else {
        error = "User not found";
        success = false;
        return cb(null, false);
      }
    } catch (err) {
      console.log(err);
      error = "Server error";
    }
  })
);
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});
module.exports = router;