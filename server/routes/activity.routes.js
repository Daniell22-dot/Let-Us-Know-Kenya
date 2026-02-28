const express = require('express');
const router = express.Router();
const activity = require('../controllers/activity.controller');
const { verifyToken } = require('../middleware/authJwt');

router.post("/", activity.log);
router.get("/", verifyToken, activity.findAll);

module.exports = router;
