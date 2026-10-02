const sequelize = require('../config/db.config');
const Sequelize = require('sequelize');
const Podcast = require('./Podcast');
const Resource = require('./Resource');
const User = require('./User');
const Blog = require('./Blog');
const Startup = require('./Startup');
const Job = require('./Job');
const Review = require('./Review');
const Project = require('./Project');
const WatchlistItem = require('./WatchlistItem');
const Subscriber = require('./Subscriber');
const ActivityLog = require('./ActivityLog');
const MarketIssuer = require('./MarketIssuer');
const MarketSnapshot = require('./MarketSnapshot');

const db = {
    Sequelize,
    sequelize,
    models: {
        Podcast,
        Resource,
        User,
        Blog,
        Startup,
        Job,
        Review,
        Project,
        WatchlistItem,
        Subscriber,
        ActivityLog,
        MarketIssuer,
        MarketSnapshot
    },
    podcasts: Podcast,
    resources: Resource,
    users: User,
    blogs: Blog,
    startups: Startup,
    jobs: Job,
    reviews: Review,
    projects: Project,
    watchlistItems: WatchlistItem,
    subscribers: Subscriber,
    activityLogs: ActivityLog,
    marketIssuers: MarketIssuer,
    marketSnapshots: MarketSnapshot
};

module.exports = db;
