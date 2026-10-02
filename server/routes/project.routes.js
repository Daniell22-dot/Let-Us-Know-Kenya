const express = require('express');
const router = express.Router();
const projects = require("../controllers/project.controller.js");
const { verifyToken, isAdmin } = require('../middleware/authJwt');

// Create a new Project
router.post("/", verifyToken, isAdmin, projects.create);

// Retrieve all Projects
router.get("/", projects.findAll);

// Retrieve a single Project with id
router.get("/:id", projects.findOne);

// Update a Project with id
router.put("/:id", verifyToken, isAdmin, projects.update);

// Delete a Project with id
router.delete("/:id", verifyToken, isAdmin, projects.delete);

module.exports = router;
