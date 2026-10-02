const express = require('express');
const router = express.Router();
const jobs = require('../controllers/job.controller');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

router.post("/", verifyToken, isAdmin, jobs.create);
router.get("/", jobs.findAll);
router.put("/:id", verifyToken, isAdmin, jobs.update);
router.delete("/:id", verifyToken, isAdmin, jobs.delete);

module.exports = router;
