const express = require('express');
const router = express.Router();
const startups = require('../controllers/startup.controller');

router.post("/", startups.create);
router.get("/", startups.findAll);
router.put("/:id", startups.update);
router.delete("/:id", startups.delete);
router.put("/:id/approve", startups.approve);
router.put("/:id/reject", startups.reject);

module.exports = router;
