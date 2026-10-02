const express = require('express');
const router = express.Router();
const reviews = require('../controllers/review.controller');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

// Get all reviews (with optional ?entityType=blog&entityId=1 filters)
router.get('/', reviews.findAll);

// Create a review (any signed-in user)
router.post('/', verifyToken, reviews.create);

// Delete a review (admin only)
router.delete('/:id', verifyToken, isAdmin, reviews.delete);

module.exports = router;
