const router = require("express").Router()

router.get("/test", async (req, res) => {
    try {
        return res.json({ success: true, message: 'App is working' })
    } catch (error) {
        return res.json({ success: false, error: error.message })
    }
})

module.exports = router;