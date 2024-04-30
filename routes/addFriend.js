const router = require("express").Router()
const db = require("../database.js")
router.post("/add-friend", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const { id: sid, email: sid_email } = req.user;
            const { rid, friendList } = req.body;
            if (friendList[rid] == null) {
                let data = await db.query("select email from users where id=$1", [rid]);
                let pid = "";
                if (sid < rid) pid = sid_email + data.rows[0].email;
                else pid = data.rows[0].email + sid_email;
                await db.query("insert into friend (pid,sid,rid,status) values ($1,$2,$3,0)", [pid, sid, rid]);
                friendList[rid] = 'q';
                res.json({ success: true, friends: friendList });
            }
            else {

                if (friendList[rid] == 'f') res.json({ sucess: false, error: "You both are already friend!" });
                else if (friendList[rid] == 'p') res.json({ sucess: false, error: "Please accept the friend request to become a friend!" });
                else res.json({ success: false, error: "Your friend request is already sented, Please wait for other's response!" });
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
