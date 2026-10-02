const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const upload = require('../middleware/upload');
const { verifyToken, isAdmin } = require('../middleware/authJwt');
const passport = require('passport');
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');

// User Authentication
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", verifyToken, authController.getProfile);

// Google OAuth. Both routes 404 as JSON when Google OAuth is not configured,
// because passport.config.js only registers the strategy if credentials exist.
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/?error=oauth_failed` }),
    authController.googleCallback);

// File Uploads (admin only -- previously an open 50MB write for any visitor)
router.post("/upload", verifyToken, isAdmin, upload.single('file'), authController.uploadFile);

module.exports = router;
