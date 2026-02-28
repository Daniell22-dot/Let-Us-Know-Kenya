const db = require('../models');
const { Op } = require('sequelize');

exports.searchAll = async (req, res) => {
    try {
        const query = req.query.q || '';

        if (!query.trim()) {
            return res.status(200).send({ blogs: [], podcasts: [], resources: [], projects: [] });
        }

        const searchCondition = {
            [Op.or]: [
                { title: { [Op.substring]: query } },
                { description: { [Op.substring]: query } }
            ]
        };
        const blogCondition = {
            [Op.or]: [
                { title: { [Op.substring]: query } },
                { excerpt: { [Op.substring]: query } }
            ]
        };
        const resourceCondition = {
            [Op.or]: [
                { name: { [Op.substring]: query } },
                { description: { [Op.substring]: query } }
            ]
        };
        const projectCondition = {
            [Op.or]: [
                { title: { [Op.substring]: query } },
                { abstract: { [Op.substring]: query } }
            ]
        };

        // Query all tables simultaneously
        const [blogs, podcasts, resources, projects] = await Promise.all([
            db.blogs.findAll({ where: blogCondition, limit: 10 }),
            db.podcasts.findAll({ where: searchCondition, limit: 10 }),
            db.resources.findAll({ where: resourceCondition, limit: 10 }),
            db.projects.findAll({ where: projectCondition, limit: 10 })
        ]);

        res.status(200).send({
            blogs,
            podcasts,
            resources,
            projects
        });

    } catch (error) {
        console.error("Search error:", error);
        res.status(500).send({ message: "An error occurred during search." });
    }
};
