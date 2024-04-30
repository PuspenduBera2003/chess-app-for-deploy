const router = require("express").Router()
const db = require("../database.js")
router.post("/unsend-request", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const { sid, rid, friendList } = req.body;
            if (friendList[rid] == 'q') {
                let data = await db.query("delete from friend where (sid=$1 and rid=$2 and status=0) or (sid=$2 and rid=$1 and status=0)", [sid, rid]);
                if (!data.rowCount) return res.json({ success: false, error: "Your Request Either Accepted or Rejected" })
                delete friendList[rid];
                return res.json({ success: true, friends: friendList });
            }
            else {
                return res.json({ success: false, error: "You both are already become friend, So try to unfriend instead!" })
            }
        }
        catch (err) {
            return res.json({ success: false, error: err.message });
        }
    }
    else {
        return res.json({ success: false, error: "User is not authenticated" });
    }
})

module.exports = router;