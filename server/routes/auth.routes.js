const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/authJwt');
const passport = require('passport');

// User Authentication
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", verifyToken, authController.getProfile);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), authController.googleCallback);

// File Uploads
router.post("/upload", upload.single('file'), authController.uploadFile);

module.exports = router;
