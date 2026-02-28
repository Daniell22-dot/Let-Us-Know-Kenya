const express = require('express');
const router = express.Router();
const resources = require('../controllers/resource.controller');

// Create a new Resource
router.post("/", resources.create);

// Retrieve all Resources
router.get("/", resources.findAll);

// Update a Resource with id
router.put("/:id", resources.update);

// Delete a Resource with id
router.delete("/:id", resources.delete);

module.exports = router;
