const express = require('express');
const router = express.Router();
const activity = require('../controllers/activity.controller');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

router.post("/", activity.log);
// Audit records carry IP addresses and user agents, so reading them is an
// admin-only capability rather than something any signed-in user can do.
router.get("/", verifyToken, isAdmin, activity.findAll);

module.exports = router;
