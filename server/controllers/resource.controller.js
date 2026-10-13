const db = require('../models');
const Resource = db.models.Resource;
const { Op } = require('sequelize');

const NATURAL_CATEGORIES = [
    'National Parks & Reserves', 'Wildlife', 'Forests', 'Marine & Coastal',
    'Water Bodies', 'Wetlands', 'Mountains', 'Minerals', 'Renewable Energy'
];
const HUMAN_CATEGORIES = [
    'Skills & Talent', 'Technology & Innovation', 'Entrepreneurship',
    'Finance & Investment', 'Infrastructure', 'Education & Training',
    'Healthcare Workforce'
];

const MAX_LIMIT = 500;

const toList = (value) => {
    if (value === undefined || value === null || value === '') return null;
    return Array.isArray(value) ? value : String(value).split(',').map((v) => v.trim()).filter(Boolean);
};

/**
 * Builds the query filter from the request.
 *
 * Note on grouping: `type` holds a descriptive subtype such as "Forest" or
 * "Lake", not the natural/human grouping. Grouping is therefore decided by which
 * canonical category list a row's category belongs to. Filtering on `type` here
 * returned nothing at all.
 */
const buildWhere = (query) => {
    const where = {};
    const categories = toList(query.category);
    const regions = toList(query.region);
    const group = (query.group || '').toLowerCase();
    const search = (query.search || '').trim();

    if (categories) {
        where.category = { [Op.in]: categories };
    }

    if (group === 'natural') {
        where.category = { [Op.in]: NATURAL_CATEGORIES };
    } else if (group === 'human') {
        where.category = { [Op.in]: HUMAN_CATEGORIES };
    }

    if (regions) {
        where.region = { [Op.in]: regions };
    }

    if (search) {
        const term = `%${search}%`;
        where[Op.or] = [
            { name: { [Op.iLike]: term } },
            { description: { [Op.iLike]: term } },
            { detail: { [Op.iLike]: term } },
            { region: { [Op.iLike]: term } },
            { type: { [Op.iLike]: term } }
        ];
    }

    return where;
};

// Paginated resource listing.
//
// This previously returned every row with no limit. Once the Kenya dataset was
// seeded that meant a single request carrying well over half a megabyte of
// descriptions, which timed out on a managed database connection.
exports.findAll = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), MAX_LIMIT);
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const where = buildWhere(req.query);

        const { rows, count } = await Resource.findAndCountAll({
            where,
            limit,
            offset: (page - 1) * limit,
            order: [['name', 'ASC']]
        });

        res.json({
            data: rows,
            meta: {
                total: count,
                page,
                limit,
                pages: Math.max(1, Math.ceil(count / limit))
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Lightweight listing for the map.
 *
 * The map needs every point at once but not the descriptions, so this trims the
 * payload to the fields a marker actually renders. Same number of rows as the
 * full listing, a fraction of the size.
 */
exports.points = async (req, res) => {
    try {
        const rows = await Resource.findAll({
            attributes: ['id', 'name', 'category', 'region', 'type', 'coordinates'],
            where: buildWhere(req.query),
            order: [['name', 'ASC']]
        });

        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/** Distinct values used to populate the public filters without loading rows. */
exports.facets = async (req, res) => {
    try {
        const [regions, categories] = await Promise.all([
            Resource.findAll({ attributes: ['region'], group: ['region'], order: [['region', 'ASC']] }),
            Resource.findAll({ attributes: ['category'], group: ['category'], order: [['category', 'ASC']] })
        ]);

        res.json({
            regions: regions.map((r) => r.region).filter(Boolean),
            categories: categories.map((c) => c.category).filter(Boolean)
        });
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
