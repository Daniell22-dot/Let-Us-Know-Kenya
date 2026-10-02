const express = require('express');
const router = express.Router();
const podcasts = require('../controllers/podcast.controller');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

// Create a new Podcast
router.post("/", verifyToken, isAdmin, podcasts.create);

// Retrieve all Podcasts
router.get("/", podcasts.findAll);

// Update a Podcast with id
router.put("/:id", verifyToken, isAdmin, podcasts.update);

// Delete a Podcast with id
router.delete("/:id", verifyToken, isAdmin, podcasts.delete);

module.exports = router;
