const ActivityLog = require('../models/ActivityLog');

exports.log = async (req, res) => {
    try {
        const { action, details, pageUrl } = req.body;

        await ActivityLog.create({
            userId: req.userId || null,
            action,
            details,
            pageUrl,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(204).send();
    } catch (error) {
        console.error("Activity logging error:", error);
        res.status(500).send({ message: "Error logging activity" });
    }
};

exports.findAll = async (req, res) => {
    try {
        const { Op } = require('sequelize');

        // Bounded so a large audit table cannot be pulled into memory in one go.
        const limit = Math.min(Number(req.query.limit) || 200, 1000);
        const where = {};

        if (req.query.action) where.action = req.query.action;

        const term = (req.query.search || '').trim();
        if (term) {
            where[Op.or] = [
                { action: { [Op.iLike]: `%${term}%` } },
                { details: { [Op.iLike]: `%${term}%` } },
                { pageUrl: { [Op.iLike]: `%${term}%` } }
            ];
        }

        const logs = await ActivityLog.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit
        });
        res.status(200).send(logs);
    } catch (error) {
        console.error("Activity read error:", error);
        res.status(500).send({ message: error.message });
    }
};
