const db = require('../models');
const Resource = db.models.Resource;

// Get all resources
exports.findAll = async (req, res) => {
    try {
        const resources = await Resource.findAll();
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new resource
exports.create = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ message: "Name can not be empty!" });
        }

        const resource = await Resource.create(req.body);
        res.status(201).json(resource);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update resource
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await Resource.update(req.body, {
            where: { id: id }
        });

        if (updated) {
            const updatedRes = await Resource.findByPk(id);
            return res.json(updatedRes);
        }
        throw new Error('Resource not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete resource
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Resource.destroy({
            where: { id: id }
        });

        if (deleted) {
            return res.json({ message: "Resource was deleted successfully!" });
        }
        throw new Error('Resource not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
