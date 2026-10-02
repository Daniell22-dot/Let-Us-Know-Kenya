const express = require('express');
const router = express.Router();
const startups = require('../controllers/startup.controller');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

// Public submission from the "Submit Startup" form. Stays open to everyone, but
// the controller forces status to "pending" so nothing self-approves.
router.post("/", startups.create);

router.get("/", startups.findAll);

// Admin-only moderation and management
router.put("/:id", verifyToken, isAdmin, startups.update);
router.delete("/:id", verifyToken, isAdmin, startups.delete);
router.put("/:id/approve", verifyToken, isAdmin, startups.approve);
router.put("/:id/reject", verifyToken, isAdmin, startups.reject);

module.exports = router;
