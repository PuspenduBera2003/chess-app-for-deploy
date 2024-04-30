const express = require("express");
const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const multer = require("multer");
const config = require("../config/firebaseConfig.js");
const db = require("../database.js");
const router = express.Router();
const axios = require("axios");
const sharp = require("sharp");
// Initialize a firebase application
initializeApp(config.firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();
// Setting up multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-or-delete-photo", upload.single("profileImage"), async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            if (req.user.profile_photo != null) {
                try {
                    await axios.delete(`${req.user.profile_photo}`);
                } catch (err) { }
                await db.query("update users set profile_photo=$1 where id=$2", [null, req.user.id]);
                await db.query("update feedback set profile_photo=$1 where username=$2", [null, req.user.username]);
            }

            const compressedImage = await sharp(req.file.buffer).resize({ width: 200, height: 200 }).toBuffer();
            const dateTime = giveCurrentDateTime();

            const storageRef = ref(storage, `files/${req.file.originalname + "       " + dateTime}`);

            // Create file metadata including the content type
            const metadata = {
                contentType: req.file.mimetype,
            };

            // Upload the file in the bucket storage
            const snapshot = await uploadBytesResumable(storageRef, compressedImage, metadata);

            // Grab the public URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            const result = await db.query("update users set profile_photo=$1 where id=$2 returning *", [downloadURL, req.user.id]);
            await db.query("update feedback set profile_photo=$1 where username=$2 ", [downloadURL, req.user.username]);
            const user = result.rows[0];
            req.login(user, (err) => {
                if (err) res.json({ success: false, error: err.message });
                else {
                    return res.json({
                        success: true, error: "nothing",
                        message: 'file uploaded to firebase storage',
                        name: req.file.originalname,
                        type: req.file.mimetype,
                        downloadURL: downloadURL
                    });
                }
            });

        } catch (error) {
            return res.json({ success: false, error: error.message });
        }
    }
    else {
        res.json({ success: false, error: "Not Authenticated yet." });
    }
});

router.delete("/upload-or-delete-photo", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            if (req.user.profile_photo != null) {
                try {
                    await axios.delete(`${req.user.profile_photo}`);
                } catch (err) { console.error(err); }
                const result = await db.query("update users set profile_photo=$1 where id=$2 returning *", [null, req.user.id]);
                await db.query("update feedback set profile_photo=$1 where username=$2", [null, req.user.username]);
                const user = result.rows[0];
                req.login(user, (err) => {
                    if (err) res.json({ success: false, error: err.message });
                    else {
                        return res.json({
                            success: true, message: 'Profile Photo Deleted Sucessfully'
                        });
                    }
                });
            }
            else {
                return res.json({ success: false, error: "You don't have a profile photo!" });
            }
        }
        catch (error) {
            return res.json({ success: false, error: error.message });
        }
    }
    else {
        res.json({ success: false, error: "Not Authenticated yet." });
    }

});


const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
};


module.exports = router;