const express = require('express');
const router = express.Router();
const blogs = require('../controllers/blog.controller');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

// Create a new Blog
router.post("/", verifyToken, isAdmin, blogs.create);

// Retrieve all Blogs
router.get("/", blogs.findAll);

// Update a Blog with id
router.put("/:id", verifyToken, isAdmin, blogs.update);

// Delete a Blog with id
router.delete("/:id", verifyToken, isAdmin, blogs.delete);

// Vote on a Blog (upvote/downvote)
router.post("/:id/vote", verifyToken, blogs.vote);

module.exports = router;
