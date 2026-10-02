const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletter.controller');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

router.post("/subscribe", newsletterController.subscribe);

// Admin-only audit of the mailing list.
router.get("/subscribers", verifyToken, isAdmin, newsletterController.getSubscribers);
router.delete("/subscribers/:id", verifyToken, isAdmin, newsletterController.deleteSubscriber);

module.exports = router;