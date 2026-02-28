const express = require('express');
const router = express.Router();
const blogs = require('../controllers/blog.controller');

// Create a new Blog
router.post("/", blogs.create);

// Retrieve all Blogs
router.get("/", blogs.findAll);

// Update a Blog with id
router.put("/:id", blogs.update);

// Delete a Blog with id
router.delete("/:id", blogs.delete);

// Vote on a Blog (upvote/downvote)
router.post("/:id/vote", blogs.vote);

module.exports = router;
