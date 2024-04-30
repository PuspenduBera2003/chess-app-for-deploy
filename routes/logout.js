const express = require("express");
const passport = require("passport");
const Strategy = require("passport-local");
const router = express.Router();
const db = require("../database.js");
const bcrypt = require("bcrypt");

router.post("/logout", (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const userID = req.user.id;
      req.logout(function (err) {
        if (err) {
          res.json({ success: false, error: "Server error,session time out" });
          return next(err);
        }
        else {
          res.json({ success: true, error: "nothing" });
        }
      });
    }
    catch (err) {
      res.json({ success: false, error: "Server error" });
    }
  } else {
    res.json({ success: false, error: "Session time out" });
  }
});

module.exports = router;