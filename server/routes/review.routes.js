const express = require('express');
const router = express.Router();
const reviews = require('../controllers/review.controller');

// Get all reviews (with optional ?entityType=blog&entityId=1 filters)
router.get('/', reviews.findAll);

// Create a review
router.post('/', reviews.create);

// Delete a review
router.delete('/:id', reviews.delete);

module.exports = router;
