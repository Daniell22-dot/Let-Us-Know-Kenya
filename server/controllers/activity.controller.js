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
        const logs = await ActivityLog.findAll({
            order: [['createdAt', 'DESC']],
            limit: 100
        });
        res.status(200).send(logs);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
