const router = require("express").Router()
const db = require("../database.js")
const arrayToObject = require("../utils/arrayToObject.js")
router.post("/friend-list", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const { id } = req.user;
            let friendObj = {}
            let data = await db.query("select rid as id from friend where sid=$1 and status=1 union select sid from friend where rid=$1 and status=1", [id]);
            Object.assign(friendObj, arrayToObject(data.rows,'f'));
            data = await db.query("select rid as id from friend where sid=$1 and status=0", [id]);
            Object.assign(friendObj, arrayToObject(data.rows,'q'));
            data = await db.query("select sid as id from friend where rid=$1 and status=0", [id]);
            Object.assign(friendObj, arrayToObject(data.rows,'p'));
            res.json({ sucess: true, friends: friendObj });
        }
        catch (err) { 
            res.json({ sucess: false, error: err.message });
        }
    }
    else {
        res.json({ sucess: false, error: "User not authenticated" });
    }
})

module.exports = router;