const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlist.controller');
const { verifyToken } = require('../middleware/authJwt');

// All watchlist routes require authentication
router.use(verifyToken);

router.post("/", watchlistController.addToWatchlist);
router.delete("/:entityType/:entityId", watchlistController.removeFromWatchlist);
router.get("/", watchlistController.getUserWatchlist);

module.exports = router;
