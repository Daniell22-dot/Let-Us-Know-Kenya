const db = require('../models');
const Job = db.models.Job;

// Get all jobs
exports.findAll = async (req, res) => {
    try {
        const jobs = await Job.findAll();
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new job
exports.create = async (req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).json({ message: "Title can not be empty!" });
        }

        const job = await Job.create(req.body);
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update job
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await Job.update(req.body, {
            where: { id: id }
        });

        if (updated) {
            const updatedJob = await Job.findByPk(id);
            return res.json(updatedJob);
        }
        throw new Error('Job not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete job
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Job.destroy({
            where: { id: id }
        });

        if (deleted) {
            return res.json({ message: "Job was deleted successfully!" });
        }
        throw new Error('Job not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
