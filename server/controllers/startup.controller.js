const db = require('../models');
const Startup = db.models.Startup;

// Get all startups
exports.findAll = async (req, res) => {
    try {
        const startups = await Startup.findAll();
        res.json(startups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new startup
exports.create = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ message: "Name can not be empty!" });
        }

        const startup = await Startup.create(req.body);
        res.status(201).json(startup);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update startup
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await Startup.update(req.body, {
            where: { id: id }
        });

        if (updated) {
            const updatedStartup = await Startup.findByPk(id);
            return res.json(updatedStartup);
        }
        throw new Error('Startup not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete startup
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Startup.destroy({
            where: { id: id }
        });

        if (deleted) {
            return res.json({ message: "Startup was deleted successfully!" });
        }
        throw new Error('Startup not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Approve startup
exports.approve = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await Startup.update({ status: 'approved' }, { where: { id } });
        if (updated) {
            const startup = await Startup.findByPk(id);
            return res.json(startup);
        }
        throw new Error('Startup not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reject startup
exports.reject = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await Startup.update({ status: 'rejected' }, { where: { id } });
        if (updated) {
            const startup = await Startup.findByPk(id);
            return res.json(startup);
        }
        throw new Error('Startup not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
