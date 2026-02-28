const db = require('../models');
const Podcast = db.models.Podcast;

// Get all podcasts
exports.findAll = async (req, res) => {
    try {
        const podcasts = await Podcast.findAll();
        res.json(podcasts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new podcast
exports.create = async (req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).json({ message: "Content can not be empty!" });
        }

        const podcastData = {
            title: req.body.title,
            host: req.body.host,
            length: req.body.length,
            tags: req.body.tags,
            description: req.body.description,
            audioUrl: req.body.audioUrl,
            status: req.body.status,
            thumbnail: req.body.thumbnail,
            category: req.body.category,
            featured: req.body.featured
        };

        const podcast = await Podcast.create(podcastData);
        res.status(201).json(podcast);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update podcast
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await Podcast.update(req.body, {
            where: { id: id }
        });

        if (updated) {
            const updatedPost = await Podcast.findByPk(id);
            return res.json(updatedPost);
        }
        throw new Error('Podcast not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete podcast
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Podcast.destroy({
            where: { id: id }
        });

        if (deleted) {
            return res.json({ message: "Podcast was deleted successfully!" });
        }
        throw new Error('Podcast not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
