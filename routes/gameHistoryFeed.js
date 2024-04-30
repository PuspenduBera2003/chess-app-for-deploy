const express = require("express");
const router = express.Router();
const db = require("../database.js");

router.get("/game-history-feed", async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const { offset } = req.query;
            const { id } = req.user;

            const parsedOffset = parseInt(offset, 10);
            const offsetValue = isNaN(parsedOffset) ? 0 : parsedOffset;

            const query = `
                SELECT
                    username AS opponent_name,
                    profile_photo AS opponent_photo,
                    g.white_id,
                    g.moves,
                    g.message,
                    g.conclusion,
                    g.date
                FROM
                    (
                        SELECT
                            white_id AS opponent_id,
                            white_id,
                            moves,
                            message,
                            conclusion,
                            date
                        FROM
                            game_history
                        WHERE
                            black_id = $1
                        UNION ALL
                        SELECT
                            black_id,
                            white_id,
                            moves,
                            message,
                            conclusion,
                            date
                        FROM
                            game_history
                        WHERE
                            white_id = $1
                    ) AS g
                JOIN
                    users
                ON
                    g.opponent_id = users.id
                ORDER BY
                    g.date DESC
                OFFSET
                    $2
                LIMIT
                    6`;

            const history = await db.query(query, [id, offsetValue]);
            res.json({ success: true, history: history.rows });
        } else {
            res.json({ success: false, error: "Not Authenticated yet." });
        }
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

module.exports = router;
