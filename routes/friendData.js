const router = require("express").Router()
const db = require("../database.js")
router.post("/friend-data", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
          const { id } = req.user;
          let data=await db.query("select u.username,u.profile_photo,u.id from friend f join users u on (f.sid=$1  and  f.status=1 and u.id=f.rid) or (f.rid=$1  and  f.status=1 and u.id=f.sid)",[id]);
          res.json({ success: true, friendData: data.rows});
        }
        catch (err) {
            res.json({ success: false, error: err.message });
        }
    }
    else {
        res.json({ success: false, error: "User not authenticated" });
    }
})

module.exports=router;