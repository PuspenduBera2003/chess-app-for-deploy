const router = require("express").Router()
const db = require("../database.js")
router.post("/pending-data", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
          let {id} = req.user;
          let data=await db.query("select u.id,u.username,u.profile_photo from friend f join users u on (f.rid=$1  and  f.status=0 and u.id=f.sid)",[id]);  
          res.json({ success: true, pendingData: data.rows});
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