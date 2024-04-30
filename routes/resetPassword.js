const express = require("express");
const db = require("../database.js");
const bcrypt = require("bcrypt");
const router = express.Router();
const saltRounds = 10;
router.post("/reset-password", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const { oldPassword, newPassword } = req.body;
      bcrypt.compare(oldPassword, req.user.password, (err, valid) => {
        if (err) {
          //Error with password check
          res.json({ success: false, error: err.message });
        } else {
          if (valid) {
            //Passed password check
            bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
              if (err) {
                console.error("Error hashing password:", err);
                res.json({ success: false, error: err.message });
              } else {
                const result = await db.query("update users set password=$1 where id=$2 RETURNING *", [hash, req.user.id]);
                const user = result.rows[0];
                req.login(user, (err) => {
                  if (err) res.json({ success: false, error: err.message });
                  else {
                    res.json({ success: true, error: "nothing" });
                  }
                });
              }
            });
          } else {
            //Did not pass password check
            res.json({ success: false, error: "Old Password Doesn't Match!" });
          }
        }
      });
    }
    catch (err) {
      res.json({ success: false, error: err.message });
    }
  }
  else {
    return res.json({ success: false, error: "You are not authenticated yet!" });
  }
});
module.exports = router;