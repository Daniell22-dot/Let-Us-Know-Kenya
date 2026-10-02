/**
 * Loads the generated Kenya resource dataset into the Resource table.
 *
 * Usage:
 *   npm run seed-resources
 *
 * The data itself lives in server/data/kenya-resources.js and is produced from
 * GeoNames (CC BY 4.0) and OCHA/HDX county boundaries. It is geographic only:
 * economicValue and tourismPotential are null because the source data carries
 * no valuations.
 *
 * Idempotent by design. Every record keeps its GeoNames id, and that id is used
 * as a natural key so re-running updates rows in place instead of duplicating
 * them. Generated rows are also marked so a later --reset can clear them without
 * touching anything an editor added by hand.
 */
require('dotenv').config();

const db = require('./models');
const Resource = db.resources;
const dataset = require('./data/kenya-resources');

const RESET = process.argv.includes('--reset');

async function main() {
    const target = process.env.NEON_URL ? 'Neon (NEON_URL)' : `local ${process.env.DB_HOST}:${process.env.DB_PORT}`;
    console.log(`Connecting to ${target}...`);
    await db.sequelize.authenticate();

    await db.sequelize.sync();

    if (RESET) {
        // geonameId is only ever set by this script, so this is a safe scope.
        const { count } = await Resource.destroy({ where: { geonameId: { [db.Sequelize.Op.ne]: null } } });
        console.log(`Reset: removed ${count} generated resource rows.`);
    }

    const before = await Resource.count();
    console.log(`Resource rows before: ${before}`);

    // Bulk upsert on the GeoNames id. Rows hand-written in the admin panel have
    // a null geonameId and are therefore left untouched.
    const rows = dataset.map((r) => ({
        name: r.name,
        region: r.region,
        type: r.type,
        detail: r.detail,
        description: r.description,
        coordinates: r.coordinates,
        images: r.images || [],
        status: r.status || 'published',
        featured: !!r.featured,
        category: r.category,
        economicValue: r.economicValue,
        conservationStatus: r.conservationStatus,
        tourismPotential: r.tourismPotential,
        geonameId: r.geonameId
    }));

    const BATCH = 500;
    for (let i = 0; i < rows.length; i += BATCH) {
        await Resource.bulkCreate(rows.slice(i, i + BATCH), {
            updateOnDuplicate: [
                'name', 'region', 'type', 'detail', 'description', 'coordinates',
                'images', 'status', 'featured', 'category', 'economicValue',
                'conservationStatus', 'tourismPotential'
            ],
            upsertKeys: ['geonameId']
        });
    }

    const after = await Resource.count();
    console.log(`Loaded ${rows.length} generated records.`);
    console.log(`Resource rows after: ${after}`);

    const byCategory = await Resource.findAll({
        attributes: ['category', [db.Sequelize.fn('COUNT', db.sequelize.col('id')), 'n']],
        group: ['category'],
        order: [[db.Sequelize.literal('n'), 'DESC']],
        raw: true
    });
    console.log('\nResources by category:');
    byCategory.forEach((row) => console.log(`  ${String(row.category).padEnd(28)} ${row.n}`));

    const counties = await Resource.findAll({
        attributes: ['region', [db.Sequelize.fn('COUNT', db.sequelize.col('id')), 'n']],
        group: ['region'],
        order: [[db.Sequelize.literal('n'), 'DESC']],
        raw: true
    });
    console.log(`\nDistinct regions: ${counties.length}`);

    await db.sequelize.close();
}

main().catch(async (err) => {
    console.error('Failed to seed resources:', err.message);
    try {
        await db.sequelize.close();
    } catch (_) {
        /* ignore */
    }
    process.exitCode = 1;
});