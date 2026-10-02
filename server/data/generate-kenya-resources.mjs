import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '..', '..');
const LUK = process.argv[2];

if (!LUK || !existsSync(LUK)) {
    console.error(`Usage: node generate-kenya-resources.mjs <source-dir>

<source-dir> must contain:
  KE.txt                     GeoNames Kenya dump, unzipped
  boundaries/ken_admin1.geojson      county polygons (HDX COD-AB)
  boundaries/ken_adminpoints.geojson county representative points
  geo/*.txt                  neighbouring GeoNames dumps (UG, TZ, RW, BI, SS)

Downloads:
  https://download.geonames.org/export/dump/KE.zip
  https://download.geonames.org/export/dump/UG.zip   (and TZ, RW, BI, SS)
  https://data.humdata.org/dataset/cod-ab-ken
`);
    process.exit(1);
}

/* ------------------------------------------------------------------ *
 * 1. GeoNames: Kenya plus neighbours, so border lakes and towns that
 *    GeoNames files under the wrong country still get picked up.
 * ------------------------------------------------------------------ */
const parse = (file) =>
    readFileSync(file, 'utf8').split('\n').filter(Boolean).map((line) => {
        const p = line.split('\t');
        return {
            id: p[0], name: p[1], alt: p[3], lat: Number(p[4]), lng: Number(p[5]),
            fclass: p[6], fcode: p[7], cc: p[8], population: Number(p[14]) || 0,
            dem: Number(p[16]) || 0
        };
    });

const rows = [...parse(`${LUK}/KE.txt`)];
for (const f of readdirSync(`${LUK}/geo`)) rows.push(...parse(`${LUK}/geo/${f}`));
console.log(`merged GeoNames rows: ${rows.length}`);

/* ------------------------------------------------------------------ *
 * 2. Official county polygons (OCHA/HDX COD-AB)
 * ------------------------------------------------------------------ */
const countiesGeo = JSON.parse(readFileSync(`${LUK}/boundaries/ken_admin1.geojson`, 'utf8'));
const pointsGeo = JSON.parse(readFileSync(`${LUK}/boundaries/ken_adminpoints.geojson`, 'utf8'));

const countyPoints = new Map(
    pointsGeo.features.filter((f) => f.properties.admin_level === 1)
        .map((f) => [f.properties.name, { lat: Number(f.properties.y_coord), lng: Number(f.properties.x_coord) }])
);

const bbox = (geometry) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const walk = (c) => c.forEach((v) => {
        if (typeof v[0] === 'number') {
            if (v[0] < minX) minX = v[0]; if (v[1] < minY) minY = v[1];
            if (v[0] > maxX) maxX = v[0]; if (v[1] > maxY) maxY = v[1];
        } else walk(v);
    });
    walk(geometry.coordinates);
    return [minX, minY, maxX, maxY];
};

function pointInRing(lng, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if (yi === yj) continue;
        if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

const inPolygon = (lng, lat, g) =>
    (g.type === 'Polygon' ? [g.coordinates] : g.coordinates)
        .some((rings) => pointInRing(lng, lat, rings[0]) && !rings.slice(1).some((h) => pointInRing(lng, lat, h)));

const counties = countiesGeo.features.map((f) => {
    const name = f.properties.adm1_name;
    const pt = countyPoints.get(name) || { lat: Number(f.properties.center_lat), lng: Number(f.properties.center_lon) };
    return {
        name, lat: pt.lat, lng: pt.lng,
        areaSqKm: Math.round(Number(f.properties.area_sqkm) || 0),
        geometry: f.geometry, bbox: bbox(f.geometry)
    };
}).sort((a, b) => a.name.localeCompare(b.name));

// Strict containment. A feature is only kept if its point is genuinely inside a
// Kenyan county, which is what stops Ugandan/Tanzanian lookalikes leaking in.
const countyOf = (lat, lng) => {
    for (const c of counties) {
        const [minX, minY, maxX, maxY] = c.bbox;
        if (lng < minX || lng > maxX || lat < minY || lat > maxY) continue;
        if (inPolygon(lng, lat, c.geometry)) return c.name;
    }
    return null;
};

/* ------------------------------------------------------------------ *
 * 3. Classification
 * ------------------------------------------------------------------ */
const COASTAL = new Set(['Mombasa', 'Kilifi', 'Kwale', 'Tana River', 'Lamu']);

const MAJOR_RIVERS = new Set([
    'tana', 'athi', 'galana', 'tsavo', 'mara', 'nyando', 'yala', 'nzoia', 'ruto',
    'mucomasi', 'ewaso ng iro', 'shabelle', 'juba', 'omo', 'turkwel', 'kerio',
    'songea', 'malawa', 'thika', 'kagere', 'sagana', 'molo'
]);

// GeoNames class S code "MN" is a dirty bucket: it holds real mines alongside
// mosques and monuments. Only names that actually describe extraction survive.
const MINING_TERM = /mine|mines|mining|quarry|quarries|\bpit\b|ore|diatomite|gold|marble|flourspar|fluorite|syndicate|graphite|titanium|soda|lime|limestone|copper|chromium|coal|emerald|tsavorite|murram/i;
const NOT_MINING = /mosque|masjid|church|cathedral|monument|sites|tomb|shrine|temple/i;

const classify = (r, county) => {
    const name = r.name;
    if (!name) return null;
    const lower = name.toLowerCase();

    if (r.fclass === 'L' && ['PRK', 'RESN', 'RESW', 'RESV', 'RES'].includes(r.fcode)) {
        if (/conservancy/i.test(name)) return { category: 'Wildlife', type: 'Conservancy' };
        if (/game reserve|game sanctuary|reserve/i.test(name)) return { category: 'Wildlife', type: 'Game Reserve' };
        if (/national park|monument/i.test(name)) return { category: 'National Parks & Reserves', type: 'National Park' };
        return { category: 'National Parks & Reserves', type: 'Protected Area' };
    }
    if (r.fclass === 'V' && r.fcode === 'FRST') return { category: 'Forests', type: 'Forest' };

    // Islands only count as marine when the county actually fronts the ocean.
    if (['ISL', 'ISLS'].includes(r.fcode)) {
        return COASTAL.has(county)
            ? { category: 'Marine & Coastal', type: 'Island' }
            : { category: 'Water Bodies', type: 'Island' };
    }
    if (r.fcode === 'BAY') return COASTAL.has(county)
        ? { category: 'Marine & Coastal', type: 'Bay' }
        : { category: 'Water Bodies', type: 'Bay' };
    if (r.fcode === 'BCH') return { category: 'Marine & Coastal', type: 'Beach' };
    if (r.fcode === 'RF') return COASTAL.has(county)
        ? { category: 'Marine & Coastal', type: 'Reef' }
        : null;

    if (['LK', 'LKI', 'LKS', 'LKOI'].includes(r.fcode)) return { category: 'Water Bodies', type: 'Lake' };
    if (['SWMP', 'MRSH'].includes(r.fcode)) return { category: 'Wetlands', type: 'Wetland' };
    if (r.fcode === 'SPNG') return { category: 'Water Bodies', type: 'Spring' };

    if (['STM', 'STMI', 'RVN', 'STMB', 'STMX', 'STMC'].includes(r.fcode)) {
        for (const river of MAJOR_RIVERS) {
            if (lower === river || lower.startsWith(`${river} `) || lower === `${river} river`) {
                return { category: 'Water Bodies', type: 'River' };
            }
        }
        return null;
    }

    if (['MT', 'MTS', 'PK'].includes(r.fcode)) {
        if (r.dem < 2000) return null;
        return { category: 'Mountains', type: r.fcode === 'PK' ? 'Peak' : 'Mountain' };
    }

    if (r.fclass === 'S' && ['MN', 'MNQR', 'MNMT', 'MSQE'].includes(r.fcode)) {
        if (NOT_MINING.test(name) || !MINING_TERM.test(name)) return null;
        return { category: 'Minerals', type: /quarr|murram|pit/i.test(name) ? 'Quarry' : 'Mine' };
    }

    if (r.fclass === 'S' && r.fcode === 'PS') {
        if (/geothermal/i.test(name)) return { category: 'Renewable Energy', type: 'Geothermal Plant' };
        if (/hydro/i.test(name)) return { category: 'Renewable Energy', type: 'Hydroelectric Plant' };
        if (/wind/i.test(name)) return { category: 'Renewable Energy', type: 'Wind Farm' };
        if (/solar/i.test(name)) return { category: 'Renewable Energy', type: 'Solar Plant' };
        return { category: 'Renewable Energy', type: 'Power Station' };
    }
    if (r.fclass === 'S' && ['DAM', 'DAMSB', 'WEIR'].includes(r.fcode)) {
        return { category: 'Renewable Energy', type: 'Dam' };
    }
    return null;
};

const FEATURED = new Set([
    'maasai mara', 'maasai mara game reserve', 'maasai mara national reserve',
    'tsavo national park', 'tsavo national park east', 'tsavo west national park',
    'lake nakuru', 'lake nakuru national park',
    'amboseli national park', 'amboseli game reserve',
    'mount kenya', 'mount kenya national park',
    'mount elgon', 'mount elgo national park',
    'nairobi national park', 'hells gate national park', "hell's gate national park",
    'samburu game reserve', 'meru national park', 'aberdare national park',
    'lake turkana', 'lake victoria',
    'olkaria geothermal power station', 'olkaria geothermal power plant'
]);

// Major water bodies whose GeoNames reference point sits outside Kenyan
// territory, so containment cannot place them. The coordinate is derived from
// the shoreline vertex of a county the lake actually borders, which keeps the
// record consistent with the county polygon it claims to be in.
// Lake Victoria's GeoNames reference point sits in Ugandan waters, so
// containment cannot place it. Take the vertex of a bordering county closest to
// the known Kenyan lake port: that keeps the marker on the Kenyan shoreline and
// inside the polygon it claims to belong to.
const nearestVertex = (countyName, ref) => {
    const c = counties.find((x) => x.name === countyName);
    const polys = c.geometry.type === 'Polygon' ? [c.geometry.coordinates] : c.geometry.coordinates;
    let best = null;
    let bestD = Infinity;
    for (const poly of polys) {
        for (const v of poly[0]) {
            const d = (v[0] - ref[0]) ** 2 + (v[1] - ref[1]) ** 2;
            if (d < bestD) { bestD = d; best = v; }
        }
    }
    return { lat: Number(best[1].toFixed(5)), lng: Number(best[0].toFixed(5)) };
};

const CURATED = [
    {
        name: 'Lake Victoria',
        county: 'Busia',
        at: nearestVertex('Busia', [33.9436, -0.0964]),
        note: 'Transboundary lake shared with Uganda and Tanzania. Marked at the Kenyan shoreline.'
    }
];

const slugFull = (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const norm = (v) => slugFull(v).replace(/_/g, ' ');

/* ------------------------------------------------------------------ *
 * 4. Build
 * ------------------------------------------------------------------ */
const best = new Map();
let rejected = 0;

for (const r of rows) {
    if (!r.name || !Number.isFinite(r.lat) || !Number.isFinite(r.lng)) continue;
    if (r.lat < -5 || r.lat > 5.6 || r.lng < 32 || r.lng > 42) continue;

    const county = countyOf(r.lat, r.lng);
    if (!county) { rejected += 1; continue; }

    const meta = classify(r, county);
    if (!meta) continue;

    const key = `${norm(r.name)}|${meta.category}`;
    const elevation = r.dem > 0 ? r.dem : 0;
    const prev = best.get(key);
    // Same name in two counties means one sprawling asset; keep the most
    // prominent record rather than emitting it twice.
    if (prev && prev.dem >= elevation) {
        prev.alsoIn.add(county);
        continue;
    }

    best.set(key, {
        name: r.name, county, ...meta, dem: elevation,
        lat: r.lat, lng: r.lng, geonameId: r.id,
        fclass: r.fclass, fcode: r.fcode,
        alsoIn: prev ? prev.alsoIn : new Set()
    });
}

const resources = [...best.values()].map((v) => {
    const extra = v.alsoIn.size
        ? ` Also extends into ${[...v.alsoIn].join(', ')}.`
        : '';
    const elevation = v.dem > 0 ? ` Approx. ${v.dem} m elevation.` : '';
    return {
        name: v.name,
        region: v.county,
        type: v.type,
        category: v.category,
        detail: `${v.type}, ${v.county}`,
        description: `${v.type} in ${v.county} County, Kenya.${extra}${elevation} Source: GeoNames ${v.fclass}.${v.fcode} #${v.geonameId} (CC BY 4.0).`,
        coordinates: { lat: Number(v.lat.toFixed(6)), lng: Number(v.lng.toFixed(6)) },
        conservationStatus: ['National Parks & Reserves', 'Wildlife', 'Forests', 'Wetlands'].includes(v.category)
            ? 'Protected area' : null,
        economicValue: null,
        tourismPotential: null,
        featured: FEATURED.has(norm(v.name)),
        status: 'published',
        images: [],
        geonameId: v.geonameId
    };
});

for (const c of CURATED) {
    resources.push({
        name: c.name,
        region: c.county,
        type: 'Lake',
        category: 'Water Bodies',
        detail: `Lake, ${c.county}`,
        description: `${c.note} Located in ${c.county} County, Kenya. Curated: the GeoNames reference point for this lake falls outside Kenyan territory.`,
        coordinates: { lat: c.at.lat, lng: c.at.lng },
        conservationStatus: null,
        economicValue: null,
        tourismPotential: null,
        featured: true,
        status: 'published',
        images: [],
        // Curated rows have no GeoNames id, but they still need a stable natural
        // key: a NULL would never collide under the unique index and would be
        // re-inserted on every seed run.
        geonameId: `curated:${slugFull(c.name)}`
    });
}

// Arid counties have almost no forests, lakes or parks in GeoNames, so they come
// out empty. Mapped water points are the resource that actually matters there,
// so they are filled in only where the county is still below a usable density.
const MIN_PER_COUNTY = 15;
const perCounty = {};
resources.forEach((r) => { perCounty[r.region] = (perCounty[r.region] || 0) + 1; });
const sparse = new Set(
    counties
        .filter((c) => !perCounty[c.name] || perCounty[c.name] < MIN_PER_COUNTY)
        .map((c) => c.name)
);

const seenPoints = new Set();
for (const r of rows) {
    if (!r.name || !['WTRH', 'WLL'].includes(r.fcode)) continue;
    if (r.lat < -5 || r.lat > 5.6 || r.lng < 32 || r.lng > 42) continue;
    const county = countyOf(r.lat, r.lng);
    if (!county || !sparse.has(county)) continue;
    const key = `${norm(r.name)}|${county}`;
    if (seenPoints.has(key)) continue;
    seenPoints.add(key);
    resources.push({
        name: r.name,
        region: county,
        type: r.fcode === 'WLL' ? 'Well' : 'Water Point',
        category: 'Water Bodies',
        detail: `${r.fcode === 'WLL' ? 'Well' : 'Water Point'}, ${county}`,
        description: `Mapped ${r.fcode === 'WLL' ? 'well' : 'water point'} in ${county} County, Kenya. Source: GeoNames H.${r.fcode} #${r.id} (CC BY 4.0).`,
        coordinates: { lat: Number(r.lat.toFixed(6)), lng: Number(r.lng.toFixed(6)) },
        conservationStatus: null,
        economicValue: null,
        tourismPotential: null,
        featured: false,
        status: 'published',
        images: [],
        geonameId: r.id
    });
}

resources.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

/* ------------------------------------------------------------------ *
 * 5. Emit
 * ------------------------------------------------------------------ */
writeFileSync(`${REPO}/src/shared/data/kenyaCounties.js`,
`// AUTO-GENERATED - do not edit by hand.
// Source: OCHA/HDX COD-AB "Kenya - Subnational Administrative Boundaries"
// https://data.humdata.org/dataset/cod-ab-ken
//
// These are the official county representative points, not geometric centroids,
// so for elongated counties the point can sit outside the county outline.

export const COUNTY_CENTROIDS = {
${counties.map((c) => `    ${slugFull(c.name)}: { lat: ${c.lat.toFixed(4)}, lng: ${c.lng.toFixed(4)}, label: ${JSON.stringify(c.name)}, areaSqKm: ${c.areaSqKm} },`).join('\n')}
};

export const countyNames = Object.values(COUNTY_CENTROIDS).map((c) => c.label);
`);

const places = new Map();
const addPlace = (key, value) => {
    if (!key) return;
    const k = slugFull(key);
    if (k.length > 1 && !places.has(k)) places.set(k, value);
};
for (const r of rows) {
    if (!r.name) continue;
    if (r.lat < -5 || r.lat > 5.6 || r.lng < 32 || r.lng > 42) continue;
    const ok = (r.fclass === 'P' && (r.population >= 5000 || /^PPLA/.test(r.fcode)))
        || ['LK', 'LKI', 'LKS'].includes(r.fcode)
        || (r.fclass === 'V' && r.fcode === 'FRST')
        || ['PRK', 'RESN', 'RESW', 'RESV', 'RES'].includes(r.fcode)
        || (['MT', 'PK'].includes(r.fcode) && r.dem >= 1500)
        || ['BAY', 'BCH'].includes(r.fcode);
    if (!ok) continue;
    const value = { lat: Number(r.lat.toFixed(4)), lng: Number(r.lng.toFixed(4)), label: r.name, kind: 'place' };
    addPlace(r.name, value);
    if (r.alt) r.alt.split(',').slice(0, 4).forEach((a) => {
        const t = a.trim();
        if (t.length > 2 && t.length < 40) addPlace(t, { ...value, label: r.name });
    });
}

writeFileSync(`${REPO}/src/shared/data/kenyaPlaces.js`,
`// AUTO-GENERATED - do not edit by hand.
// Source: GeoNames dumps KE/UG/TZ/RW/BI/SS, CC BY 4.0 - https://download.geonames.org/
// Populated places, lakes, forests, protected areas, high peaks and bays in Kenya.

export const PLACE_CENTROIDS = {
${[...places.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `    ${k}: { lat: ${v.lat}, lng: ${v.lng}, label: ${JSON.stringify(v.label)}, kind: 'place' },`).join('\n')}
};
`);

writeFileSync(`${REPO}/server/data/kenya-resources.js`,
`// AUTO-GENERATED - do not edit by hand. Re-run the generator instead of editing.
//
// Sources
//   Features: GeoNames country dumps, CC BY 4.0 - https://download.geonames.org/
//   Counties: OCHA/HDX COD-AB Kenya subnational boundaries - https://data.humdata.org/dataset/cod-ab-ken
//
// Every generated row keeps its GeoNames id and the county polygon that contains
// it, so any record can be traced back and regenerated. economicValue and
// tourismPotential are left null on purpose: this dataset is geographic only and
// carries no valuations.

const resources = [
${resources.map((r) => `    {
        name: ${JSON.stringify(r.name)},
        region: ${JSON.stringify(r.region)},
        type: ${JSON.stringify(r.type)},
        category: ${JSON.stringify(r.category)},
        detail: ${JSON.stringify(r.detail)},
        description: ${JSON.stringify(r.description)},
        coordinates: { lat: ${r.coordinates.lat}, lng: ${r.coordinates.lng} },
        conservationStatus: ${JSON.stringify(r.conservationStatus)},
        economicValue: ${JSON.stringify(r.economicValue)},
        tourismPotential: ${JSON.stringify(r.tourismPotential)},
        featured: ${r.featured},
        status: ${JSON.stringify(r.status)},
        images: [],
        geonameId: ${JSON.stringify(r.geonameId)}
    }`).join(',\n')}
];

module.exports = resources;
`);

/* ------------------------------------------------------------------ *
 * 6. Report
 * ------------------------------------------------------------------ */
const byCat = {};
resources.forEach((r) => { byCat[r.category] = (byCat[r.category] || 0) + 1; });
console.log(`out-of-kenya rows dropped : ${rejected}`);
console.log(`place lookup entries      : ${places.size}`);
console.log(`resource records          : ${resources.length}`);
console.log(`counties covered          : ${new Set(resources.map((r) => r.region)).size} / ${counties.length}`);
console.log(`featured                  : ${resources.filter((r) => r.featured).length}`);
console.log('\nby category:');
Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k.padEnd(28)} ${v}`));
const covered = new Set(resources.map((r) => r.region));
const missing = counties.filter((c) => !covered.has(c.name)).map((c) => c.name);
console.log(`\ncounties with no resources: ${missing.length ? missing.join(', ') : 'none'}`);