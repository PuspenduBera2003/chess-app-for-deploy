const router = require("express").Router()
const db = require("../database.js")
router.post("/accept-request", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const { id: sid } = req.user
            const { rid, friendList } = req.body;
            if (friendList[rid] == 'p') {
                let data = await db.query("update friend set status=1 where sid=$1 and rid=$2 returning *", [rid, sid]);
                if (!data.rowCount) res.json({ succcess: false, error: "The other person not send you any friend request yet otherwise he/she unsend the request !" })
                friendList[rid] = 'f';
                res.json({ success: true, friends: friendList });
            }
            else {
                if (friendList[rid] == 'f') res.json({ success: false, error: "You both are already" })
                res.json({ succcess: false, error: "Please send a friend request first and wait for other's response to become a friend" })

            }

        }
        catch (err) {
            res.json({ success: false, error: err.message });
        }
    }
    else {
        res.json({ success: false, error: "User not authenticated" });
    }
})

module.exports = router;