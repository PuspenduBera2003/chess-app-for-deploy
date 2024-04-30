const express = require("express");
const router = express.Router();
const db = require("../database.js")
router.post("/comment-status", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const { username } = req.user
      const query = "select * from feedback where username=$1;"
      const data = await db.query(query, [username])
      if (data.rows.length > 0) {
        res.json({ success: true, comment: data.rows[0].comment, rating: data.rows[0].rating });
      }
      else {
        res.json({ success: false });
      }
    } else {
      res.json({ success: false, error: "Not Authenticated yet." });
    }
  }
  catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;