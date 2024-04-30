const express = require("express");
const router = express.Router();
const db = require("../database.js")
router.post("/comment-feed", async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const { offset } = req.body;
            const query = "select * from feedback order by username offset $1 limit 6";
            const feedbacks = await db.query(query, [offset]);
            res.json({ success: true, feedbacks: feedbacks.rows });
        } else {
            res.json({ success: false, error: "Not Authenticated yet." });
        }
    }
    catch (err) {
        res.json({ success: false, error: err.message });
    }
});

module.exports = router;