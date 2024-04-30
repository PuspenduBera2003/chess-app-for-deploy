const express = require("express");
const router = express.Router();
const db = require("../database.js")
router.post("/comment-submit", async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const { username, profile_photo } = req.user
            const { rating, comment } = req.body
            const query = "INSERT INTO feedback (username, profile_photo, rating, comment) VALUES ($1, $2, $3, $4)";
            await db.query(query, [username, profile_photo, rating, comment]);
            res.json({ success: true });
        } else {
            res.json({ success: false, error: "Not Authenticated yet." });
        }
    }
    catch (err) {
        res.json({ success: false, error: err.message });
    }
});

router.put("/comment-update", async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const { username } = req.user;
            const { rating, comment } = req.body;
            const query = "update feedback set comment=$3, rating=$2 where username=$1;"
            await db.query(query, [username, rating, comment])
            res.json({ success: true });
        } else {
            res.json({ success: false, error: "Not Authenticated yet." });
        }
    }
    catch (err) {
        res.json({ success: false, error: err.message });
    }
});

module.exports = router;