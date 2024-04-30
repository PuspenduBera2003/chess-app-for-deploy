const router = require("express").Router()
const db = require("../database.js")
router.post("/reject-request", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const { sid, rid, friendList } = req.body;
            if (friendList[rid] == 'p') {
                let data = await db.query("delete from friend where sid=$1 and rid=$2 returning *", [rid, sid]);
                if (!data.rowCount) res.json({ succcess: false, error: "The other person not send you any friend request yet otherwise he/she unsend the request !" })
                delete friendList[rid];
                res.json({ success: true, friends: friendList });
            }
            else {
                if (friendList[rid] == 'f') res.json({ success: false, error: "You both are already so try to unfriend,not reject  request!" })
                res.json({ succcess: false, error: "The other person not send you any friend request yet otherwise he/she unsend the request !" })

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