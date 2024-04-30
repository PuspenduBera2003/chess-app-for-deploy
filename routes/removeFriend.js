const router = require("express").Router()
const db = require("../database.js")
router.post("/remove-friend", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const { sid, rid, friendList } = req.body;
            if (friendList[rid] == 'f') {
                await db.query("delete from friend where sid=$1 and rid=$2 or sid=$2 and rid=$1", [sid, rid]);
                delete friendList[rid];
                res.json({ success: true, friends: friendList });
            }
            else {
                res.json({ success: false, error: "You both are not become friend yet!" })
            }
        }
        catch (err) {
            res.json({ success: false, error: err.message });
        }
    }
    else {
        res.json({ success: false, error: "User is not authenticated" });
    }
})

module.exports = router;