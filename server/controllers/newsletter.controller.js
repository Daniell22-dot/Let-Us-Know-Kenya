const db = require('../models');

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
