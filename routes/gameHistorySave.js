const express = require("express");
const router = express.Router();
const db = require("../database.js")

router.post("/game-history-save", async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const { gameId, white_id, black_id, moves, message, conclusion } = req.body;
            let moveHistory = JSON.stringify(moves);
            const query = "insert into game_history (gameId,white_id,black_id,moves,message,conclusion,date) values($1,$2,$3,$4,$5,$6,to_timestamp($7))"
            await db.query(query, [gameId, white_id, black_id, moveHistory, message, conclusion, Date.now() / 1000])
            res.json({ success: true });
        }
        else {
            res.json({ success: false, error: "Not Authenticated yet." });
        }
    }
    catch (err) {
        res.json({ success: false, error: err });
    }
});

module.exports = router;