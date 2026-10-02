require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./models');
const passport = require('./config/passport.config');
const sanitizeRequest = require('./middleware/sanitize');
const hppGuard = require('./middleware/hppGuard');

const app = express();

// Required so req.ip reflects the real client behind a reverse proxy. Without
// this, every request appears to originate from the proxy, which both defeats
// per-IP rate limiting and poisons the IP recorded on activity logs.
app.set('trust proxy', 1);

// Ensure the upload destination exists before multer tries to write to it.
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Security Middlewares
// Express 5 rebuilds req.query on every access, so query-string sanitisation has
// to happen inside the parser rather than in a middleware.
app.set('query parser', sanitizeRequest.buildQueryParser());
app.use(helmet());           // Set security headers
app.use(sanitizeRequest);  // Escape user input in body and route params
app.use(hppGuard);           // Prevent HTTP Parameter Pollution

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
app.use('/uploads', express.static(UPLOAD_DIR, {
    setHeaders: (res) => {
        // Uploaded files are user-supplied; never let the browser sniff or
        // render them in the context of this origin.
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', 'attachment');
    }
}));

// Simple Route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to LUK Kenya API" });
});

// Health / readiness check
app.get('/api/health', async (req, res) => {
    try {
        await db.sequelize.authenticate();
        res.status(200).json({ status: 'ok', database: 'connected' });
    } catch (err) {
        res.status(503).json({ status: 'degraded', database: 'unreachable' });
    }
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
const marketRoutes = require('./routes/market.routes');

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
v1Router.use('/market', marketRoutes);

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
// alter:true re-introspects and rewrites every table on each boot. Against a
// managed Postgres such as Neon that is slow and can silently rewrite columns,
// so it is opt-in via DB_SYNC_ALTER. Without it Sequelize only creates tables
// that are missing, which is the safe default for a deployed database. Real
// schema changes should go through migrations.
const syncOptions = process.env.DB_SYNC_ALTER === 'true' ? { alter: true } : {};

let server;
db.sequelize.sync(syncOptions)
    .then(() => {
        console.log("Database synced successfully.");
        server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    })
    .catch((err) => {
        console.error("Failed to sync database: " + err.message);
        process.exit(1);
    });

// Close the HTTP server and drain the connection pool on shutdown so we don't
// leave dangling sockets or pooled connections behind.
const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    const forceExit = setTimeout(() => {
        console.error("Graceful shutdown timed out, forcing exit.");
        process.exit(1);
    }, 10000);
    forceExit.unref();

    const stop = async () => {
        try {
            if (server) await new Promise((resolve) => server.close(resolve));
            await db.sequelize.close();
            console.log("Shutdown complete.");
            process.exit(0);
        } catch (err) {
            console.error("Error during shutdown:", err);
            process.exit(1);
        }
    };

    if (server) {
        server.close(() => stop());
    } else {
        stop();
    }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
