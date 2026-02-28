const db = require('../models');
const Review = db.models.Review;

// Get reviews by entityType + entityId
exports.findAll = async (req, res) => {
    try {
        const { entityType, entityId } = req.query;
        const where = {};
        if (entityType) where.entityType = entityType;
        if (entityId) where.entityId = entityId;
        const reviews = await Review.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create review
exports.create = async (req, res) => {
    try {
        const { entityType, entityId, author, rating, comment } = req.body;
        if (!entityType || !entityId || !rating) {
            return res.status(400).json({ message: 'entityType, entityId, and rating are required.' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }
        const review = await Review.create({ entityType, entityId, author: author || 'Anonymous', rating, comment });
        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete review
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Review.destroy({ where: { id } });
        if (deleted) return res.json({ message: 'Review deleted successfully.' });
        throw new Error('Review not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
