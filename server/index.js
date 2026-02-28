const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const passport = require('./config/passport.config');
require('dotenv').config();
const db = require('./models');

const app = express();

// Security Middlewares
app.use(helmet()); // Set security headers
app.use(xss());    // Clean user input from XSS
app.use(hpp());    // Prevent HTTP Parameter Pollution

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // increased for dev
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ message: "Too many requests, please try again later." });
    }
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // increased for dev
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ message: "Too many authentication attempts. Please try again later." });
    }
});
app.use('/api/auth/', authLimiter);

// General Middleware
app.use(cors());
app.use(passport.initialize());
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple Route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to LUK Kenya API" });
});

// Import Routes
const podcastRoutes = require('./routes/podcast.routes');
const resourceRoutes = require('./routes/resource.routes');
const authRoutes = require('./routes/auth.routes');
const blogRoutes = require('./routes/blog.routes');
const startupRoutes = require('./routes/startup.routes');
const jobRoutes = require('./routes/job.routes');
const reviewRoutes = require('./routes/review.routes');
const projectRoutes = require('./routes/project.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const searchRoutes = require('./routes/search.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const activityRoutes = require('./routes/activity.routes');

// Routes Versioning (v1)
const v1Router = express.Router();

v1Router.use('/podcasts', podcastRoutes);
v1Router.use('/resources', resourceRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/blogs', blogRoutes);
v1Router.use('/startups', startupRoutes);
v1Router.use('/jobs', jobRoutes);
v1Router.use('/reviews', reviewRoutes);
v1Router.use('/projects', projectRoutes);
v1Router.use('/watchlist', watchlistRoutes);
v1Router.use('/search', searchRoutes);
v1Router.use('/newsletter', newsletterRoutes);
v1Router.use('/activity', activityRoutes);

app.use('/api/v1', v1Router);
// Fallback for old API calls (optional, but good for transition)
app.use('/api', v1Router);

// 404 Handler for API
app.use('/api', (req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Serve research project assets
app.use('/research-assets', express.static(path.join(__dirname, '../src/public/Reserch/Project')));

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: err.message || "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

// Sync Database
db.sequelize.sync({ alter: true })
    .then(() => {
        console.log("Database synced successfully.");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    })
    .catch((err) => {
        console.error("Failed to sync database: " + err.message);
    });
