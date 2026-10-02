const db = require('../models');
const User = db.users;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}

// Default matches the Vite dev server port in vite.config.js. Without this the
// post-login redirect pointed at :5173, where nothing is listening.
const frontendUrl = () =>
    (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).send({ message: "Username, email, and password are required." });
        }

        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).send({ message: "Password must be at least 8 characters long." });
        }

        // Check if user exists
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            return res.status(400).send({ message: "User with this email already exists." });
        }

        const usernameExists = await User.findOne({ where: { username } });
        if (usernameExists) {
            return res.status(400).send({ message: "Username is already taken." });
        }

        // Create user.
        // NOTE: pass the plaintext password. User.beforeCreate hashes it for us.
        // Hashing here as well produced bcrypt(bcrypt(plaintext)), which
        // bcrypt.compare could never match, so no registered user could log in.
        const user = await User.create({
            username,
            name: username, // Fallback for name to avoid notNull violations
            email,
            password,
            role: 'user' // Default role for public registration
        });

        // Generate token
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

        res.status(201).send({
            message: "User registered successfully!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).send({ message: error.message || "An error occurred during registration." });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ message: "Email/Username and password are required." });
        }

        // Support login by email OR username
        const { Op } = require('sequelize');
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { username: email }
                ]
            }
        });

        // Use an identical response for "no such account" and "wrong password"
        // so the endpoint cannot be used to enumerate registered emails.
        if (!user) {
            return res.status(401).send({
                token: null,
                message: "Invalid email or password."
            });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                token: null,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

        res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ message: error.message || "An error occurred during login." });
    }
};

exports.googleCallback = (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect(`${frontendUrl()}/?error=oauth_failed`);
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

        // The token is placed in the URL *fragment*. Fragments are never sent to
        // the server and never appear in access logs or Referer headers, so it
        // cannot be intercepted there. We deliberately do NOT ship the user
        // object: LoginSuccess.jsx re-fetches the profile from this API using
        // the token, so nothing about identity is trusted from the URL.
        res.redirect(`${frontendUrl()}/login-success#token=${encodeURIComponent(token)}`);
    } catch (error) {
        console.error("Google Callback error:", error);
        res.redirect(`${frontendUrl()}/?error=oauth_failed`);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) return res.status(404).send({ message: "User not found." });

        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred fetching profile." });
    }
};

// Original file upload function moved from the old auth controller
exports.uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "Please upload a file!" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.send({
        message: "Uploaded the file successfully: " + req.file.originalname,
        url: fileUrl
    });
};
