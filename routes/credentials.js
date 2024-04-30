const express = require("express");
const router = express.Router();

router.get("/credentials", (req, res) => {
    try {
        if (req.isAuthenticated()) {
            let { password, ...user } = req.user;
            const sessionID = req.sessionID;
            user.sessionID = sessionID;
            res.json({ success: true, error: "nothing", user });
        } else {
            res.json({ success: false, error: "Not Authenticated yet." });
        }
    }
    catch (err) {
        res.json({ success: false, error: err.message });
    }
});

module.exports = router;