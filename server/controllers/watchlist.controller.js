const db = require('../models');
const WatchlistItem = db.watchlistItems;
const Blog = db.blogs;
const Podcast = db.podcasts;
const Project = db.projects; // Assuming projects are added

// Add item to watchlist
exports.addToWatchlist = async (req, res) => {
    try {
        const { entityType, entityId } = req.body;
        const userId = req.userId; // From authJwt middleware

        if (!entityType || !entityId) {
            return res.status(400).send({ message: "entityType and entityId are required." });
        }

        // Check if already in watchlist
        const existingItem = await WatchlistItem.findOne({
            where: { userId, entityType, entityId }
        });

        if (existingItem) {
            return res.status(400).send({ message: "Item is already in your watchlist." });
        }

        const watchlistItem = await WatchlistItem.create({
            userId,
            entityType,
            entityId
        });

        res.status(201).send(watchlistItem);
    } catch (error) {
        console.error("Error adding to watchlist:", error);
        res.status(500).send({ message: error.message || "Failed to add to watchlist." });
    }
};

// Remove item from watchlist
exports.removeFromWatchlist = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const userId = req.userId;

        const deleted = await WatchlistItem.destroy({
            where: { userId, entityType, entityId }
        });

        if (deleted) {
            res.send({ message: "Item removed from watchlist successfully." });
        } else {
            res.status(404).send({ message: "Item not found in watchlist." });
        }
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        res.status(500).send({ message: "Failed to remove item from watchlist." });
    }
};

// Get user's watchlist
exports.getUserWatchlist = async (req, res) => {
    try {
        const userId = req.userId;
        const items = await WatchlistItem.findAll({ where: { userId } });

        // We will fetch the full associations manually since polymorphic associations in Sequelize can be tricky to set up quickly
        const populatedItems = await Promise.all(items.map(async (item) => {
            let details = null;
            if (item.entityType === 'blog') details = await Blog.findByPk(item.entityId);
            else if (item.entityType === 'podcast') details = await Podcast.findByPk(item.entityId);
            else if (item.entityType === 'project') details = await Project.findByPk(item.entityId);

            return {
                id: item.id,
                entityType: item.entityType,
                entityId: item.entityId,
                details: details || null
            };
        }));

        res.status(200).send(populatedItems.filter(i => i.details !== null));
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        res.status(500).send({ message: "Failed to fetch watchlist." });
    }
};
