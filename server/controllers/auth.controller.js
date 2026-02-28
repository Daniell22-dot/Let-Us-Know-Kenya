const db = require('../models');
const User = db.users;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).send({ message: "Username, email, and password are required." });
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

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            name: username, // Fallback for name to avoid notNull violations
            email,
            password: hashedPassword,
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

        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                token: null,
                message: "Invalid Password!"
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
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

        // Redirect to frontend with token and user data as query params or via a secure cookie/storage
        // For simplicity in this demo, redirecting to a specific path like /auth-success
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const userData = encodeURIComponent(JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }));

        res.redirect(`${frontendUrl}/login-success?token=${token}&user=${userData}`);
    } catch (error) {
        console.error("Google Callback error:", error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
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
