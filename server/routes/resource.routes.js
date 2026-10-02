const express = require('express');
const router = express.Router();
const resources = require('../controllers/resource.controller');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

// Create a new Resource
router.post("/", verifyToken, isAdmin, resources.create);

// Retrieve all Resources
router.get("/", resources.findAll);

// Update a Resource with id
router.put("/:id", verifyToken, isAdmin, resources.update);

// Delete a Resource with id
router.delete("/:id", verifyToken, isAdmin, resources.delete);

module.exports = router;
