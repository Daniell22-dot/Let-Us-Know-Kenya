const db = require('../models');
const Blog = db.models.Blog;
const { Op } = require('sequelize');

// Get all blogs
exports.findAll = async (req, res) => {
    try {
        const blogs = await Blog.findAll();
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new blog
exports.create = async (req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).json({ message: "Title can not be empty!" });
        }

        const blog = await Blog.create(req.body);
        res.status(201).json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update blog
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const [updated] = await Blog.update(req.body, {
            where: { id: id }
        });

        if (updated) {
            const updatedBlog = await Blog.findByPk(id);
            return res.json(updatedBlog);
        }
        throw new Error('Blog not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete blog
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Blog.destroy({
            where: { id: id }
        });

        if (deleted) {
            return res.json({ message: "Blog was deleted successfully!" });
        }
        throw new Error('Blog not found');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Vote on blog (upvote or downvote)
exports.vote = async (req, res) => {
    try {
        const id = req.params.id;
        const { type } = req.body; // 'up' or 'down'
        if (!['up', 'down'].includes(type)) {
            return res.status(400).json({ message: 'type must be "up" or "down"' });
        }
        const blog = await Blog.findByPk(id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        if (type === 'up') {
            await blog.increment('upvotes');
        } else {
            await blog.increment('downvotes');
        }
        await blog.reload();
        res.json({ upvotes: blog.upvotes, downvotes: blog.downvotes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
