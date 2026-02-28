const express = require('express');
const router = express.Router();
const jobs = require('../controllers/job.controller');

router.post("/", jobs.create);
router.get("/", jobs.findAll);
router.put("/:id", jobs.update);
router.delete("/:id", jobs.delete);

module.exports = router;
