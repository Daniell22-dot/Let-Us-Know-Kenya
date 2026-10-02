const express = require('express');
const router = express.Router();
const market = require('../controllers/market.controller');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

router.get('/overview', market.getOverview);

router.get('/history', market.getHistory);

router.post('/sync', verifyToken, isAdmin, market.sync);

module.exports = router;