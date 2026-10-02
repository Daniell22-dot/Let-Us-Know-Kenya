const db = require('../models');

// Admin audit view of the mailing list, newest first. Kept on this controller
// rather than a separate module so subscribe/audit live together.
exports.getSubscribers = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const term = (req.query.search || '').trim();

        const subscribers = await db.subscribers.findAll({
            where: term ? { email: { [Op.iLike]: `%${term}%` } } : undefined,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).send(subscribers);
    } catch (error) {
        console.error("Subscriber list error:", error);
        res.status(500).send({ message: "An error occurred fetching subscribers." });
    }
};

// Removes a single subscriber, e.g. after a bounce or unsubscribe request.
exports.deleteSubscriber = async (req, res) => {
    try {
        const removed = await db.subscribers.destroy({ where: { id: req.params.id } });

        if (!removed) {
            return res.status(404).send({ message: "Subscriber not found." });
        }

        res.status(200).send({ message: "Subscriber removed." });
    } catch (error) {
        console.error("Subscriber delete error:", error);
        res.status(500).send({ message: "An error occurred removing the subscriber." });
    }
};

exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).send({ message: "Email is required." });
        }

        const existingSubscriber = await db.subscribers.findOne({ where: { email } });
        if (existingSubscriber) {
            return res.status(400).send({ message: "Email already subscribed." });
        }

        await db.subscribers.create({ email });
        res.status(201).send({ message: "Successfully subscribed to the newsletter!" });
    } catch (error) {
        console.error("Subscription error:", error);
        res.status(500).send({ message: "An error occurred during subscription." });
    }
};
