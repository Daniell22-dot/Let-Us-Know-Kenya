const express = require('express');
const router = express.Router();
const podcasts = require('../controllers/podcast.controller');

// Create a new Podcast
router.post("/", podcasts.create);

// Retrieve all Podcasts
router.get("/", podcasts.findAll);

// Update a Podcast with id
router.put("/:id", podcasts.update);

// Delete a Podcast with id
router.delete("/:id", podcasts.delete);

module.exports = router;
