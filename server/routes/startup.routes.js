const express = require('express');
const router = express.Router();
const startups = require('../controllers/startup.controller');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

// Submission is restricted to signed-in users. The controller still forces
// status to "pending", so no one can self-approve their own application.
router.post("/", verifyToken, startups.create);

// Reading the directory requires a session too. This is enforced server-side
// rather than only in the interface, because a client-side gate on its own
// stops the UI from requesting the list, not anyone from calling the endpoint.
router.get("/", verifyToken, startups.findAll);

// Admin-only moderation and management
router.put("/:id", verifyToken, isAdmin, startups.update);
router.delete("/:id", verifyToken, isAdmin, startups.delete);
router.put("/:id/approve", verifyToken, isAdmin, startups.approve);
router.put("/:id/reject", verifyToken, isAdmin, startups.reject);

module.exports = router;
