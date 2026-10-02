/**
 * Approximate centroid coordinates for Kenya, keyed by a normalised region
 * name. Two kinds of entry live here:
 *
 *  - `county`  the 47 counties, for resources recorded by administrative area
 *  - `place`   well known parks, lakes and landmarks, because natural resources
 *              are usually recorded by site ("Maasai Mara") rather than county
 *
 * These are centroids, not surveyed points. A marker therefore means "this
 * resource is somewhere in this area", which is the finest precision a public
 * dashboard can honestly claim without per-resource survey data.
 */

export const COUNTY_CENTROIDS = {
    'baringo': { lat: 0.6369, lng: 35.8711, label: 'Baringo', kind: 'county' },
    'bomet': { lat: -0.4289, lng: 35.6369, label: 'Bomet', kind: 'county' },
    'bungoma': { lat: 0.7206, lng: 34.7686, label: 'Bungoma', kind: 'county' },
    'busia': { lat: 0.4631, lng: 34.1119, label: 'Busia', kind: 'county' },
    'elgeyo marakwet': { lat: 0.5104, lng: 35.2692, label: 'Elgeyo-Marakwet', kind: 'county' },
    'embu': { lat: -0.5311, lng: 37.4508, label: 'Embu', kind: 'county' },
    'garissa': { lat: -0.4547, lng: 39.6411, label: 'Garissa', kind: 'county' },
    'homa bay': { lat: -0.4211, lng: 34.7519, label: 'Homa Bay', kind: 'county' },
    'isiolo': { lat: 0.3476, lng: 37.5822, label: 'Isiolo', kind: 'county' },
    'kajiado': { lat: -1.3833, lng: 36.8833, label: 'Kajiado', kind: 'county' },
    'kakamega': { lat: 0.354, lng: 34.752, label: 'Kakamega', kind: 'county' },
    'kericho': { lat: -0.4019, lng: 35.2394, label: 'Kericho', kind: 'county' },
    'kiambu': { lat: -1.2533, lng: 36.8481, label: 'Kiambu', kind: 'county' },
    'kilifi': { lat: -3.6288, lng: 39.8494, label: 'Kilifi', kind: 'county' },
    'kirinyaga': { lat: -0.4944, lng: 37.34, label: 'Kirinyaga', kind: 'county' },
    'kisii': { lat: -0.6817, lng: 37.8667, label: 'Kisii', kind: 'county' },
    'kisumu': { lat: -0.0917, lng: 34.768, label: 'Kisumu', kind: 'county' },
    'kitui': { lat: -1.2833, lng: 37.8833, label: 'Kitui', kind: 'county' },
    'kwale': { lat: -4.0517, lng: 39.5939, label: 'Kwale', kind: 'county' },
    'laikipia': { lat: 0.1856, lng: 37.0389, label: 'Laikipia', kind: 'county' },
    'lamu': { lat: -2.2717, lng: 40.902, label: 'Lamu', kind: 'county' },
    'machakos': { lat: -1.5197, lng: 37.2633, label: 'Machakos', kind: 'county' },
    'makueni': { lat: -1.7958, lng: 37.6122, label: 'Makueni', kind: 'county' },
    'mandera': { lat: 3.9361, lng: 41.0422, label: 'Mandera', kind: 'county' },
    'marsabit': { lat: 1.5236, lng: 35.8967, label: 'Marsabit', kind: 'county' },
    'meru': { lat: 0.05, lng: 37.65, label: 'Meru', kind: 'county' },
    'migori': { lat: -1.07, lng: 34.7, label: 'Migori', kind: 'county' },
    'mombasa': { lat: -4.0435, lng: 39.6682, label: 'Mombasa', kind: 'county' },
    'muranga': { lat: -0.7806, lng: 37.04, label: "Murang'a", kind: 'county' },
    'nairobi city': { lat: -1.2864, lng: 36.8172, label: 'Nairobi City', kind: 'county' },
    'nakuru': { lat: -0.3031, lng: 36.08, label: 'Nakuru', kind: 'county' },
    'nandi': { lat: 0.0333, lng: 35.3, label: 'Nandi', kind: 'county' },
    'narok': { lat: -1.07, lng: 35.75, label: 'Narok', kind: 'county' },
    'nyamira': { lat: -0.5667, lng: 37.65, label: 'Nyamira', kind: 'county' },
    'nyandarua': { lat: -0.55, lng: 36.45, label: 'Nyandarua', kind: 'county' },
    'nyeri': { lat: -0.4167, lng: 36.95, label: 'Nyeri', kind: 'county' },
    'samburu': { lat: 1.5069, lng: 35.7716, label: 'Samburu', kind: 'county' },
    'siaya': { lat: 0.06, lng: 34.3, label: 'Siaya', kind: 'county' },
    'taita taveta': { lat: -3.4, lng: 38.0, label: 'Taita-Taveta', kind: 'county' },
    'tana river': { lat: -1.5, lng: 40.0, label: 'Tana River', kind: 'county' },
    'tharaka nithi': { lat: -0.1583, lng: 37.9833, label: 'Tharaka-Nithi', kind: 'county' },
    'trans nzoia': { lat: 1.0126, lng: 35.0062, label: 'Trans Nzoia', kind: 'county' },
    'turkana': { lat: 3.1167, lng: 35.6, label: 'Turkana', kind: 'county' },
    'uasin gishu': { lat: 0.5143, lng: 35.2698, label: 'Uasin Gishu', kind: 'county' },
    'vihiga': { lat: 0.0761, lng: 34.7189, label: 'Vihiga', kind: 'county' },
    'wajir': { lat: 1.75, lng: 40.0667, label: 'Wajir', kind: 'county' },
    'west pokot': { lat: 1.2333, lng: 35.1167, label: 'West Pokot', kind: 'county' }
};

export const PLACE_CENTROIDS = {
    'maasai mara': { lat: -1.4061, lng: 35.0078, label: 'Maasai Mara', kind: 'place' },
    'amboseli': { lat: -2.6527, lng: 37.2606, label: 'Amboseli', kind: 'place' },
    'tsavo': { lat: -2.9833, lng: 38.4667, label: 'Tsavo', kind: 'place' },
    'tsavo east': { lat: -2.9833, lng: 38.4667, label: 'Tsavo East', kind: 'place' },
    'tsavo west': { lat: -3.4167, lng: 37.3, label: 'Tsavo West', kind: 'place' },
    'lake nakuru': { lat: -0.3667, lng: 36.0833, label: 'Lake Nakuru', kind: 'place' },
    'lake naivasha': { lat: -0.3667, lng: 36.4333, label: 'Lake Naivasha', kind: 'place' },
    'lake victoria': { lat: -0.0333, lng: 33.0, label: 'Lake Victoria', kind: 'place' },
    'lake turkana': { lat: 3.5, lng: 36.0, label: 'Lake Turkana', kind: 'place' },
    'lake baringo': { lat: 0.6, lng: 35.9833, label: 'Lake Baringo', kind: 'place' },
    'lake elementaita': { lat: -0.45, lng: 36.2, label: 'Lake Elementaita', kind: 'place' },
    'lake ol bolossat': { lat: -0.1833, lng: 36.3667, label: 'Lake Ol Bolossat', kind: 'place' },
    'mount kenya': { lat: -0.1521, lng: 37.3084, label: 'Mount Kenya', kind: 'place' },
    'mount elgon': { lat: 1.1333, lng: 34.3667, label: 'Mount Elgon', kind: 'place' },
    'aberdares': { lat: -0.85, lng: 36.65, label: 'Aberdare Range', kind: 'place' },
    'aberdare': { lat: -0.85, lng: 36.65, label: 'Aberdare Range', kind: 'place' },
    'hells gate': { lat: -0.45, lng: 36.4333, label: "Hell's Gate", kind: 'place' },
    'menengai': { lat: 0.2, lng: 36.0667, label: 'Menengai Crater', kind: 'place' },
    'diani': { lat: -3.9833, lng: 39.6333, label: 'Diani Beach', kind: 'place' },
    'diani beach': { lat: -3.9833, lng: 39.6333, label: 'Diani Beach', kind: 'place' },
    'watamu': { lat: -3.35, lng: 40.0167, label: 'Watamu', kind: 'place' },
    'malindi': { lat: -3.0, lng: 40.1167, label: 'Malindi', kind: 'place' },
    'lamu archipelago': { lat: -2.2717, lng: 40.902, label: 'Lamu Archipelago', kind: 'place' },
    'kakamega forest': { lat: 0.3167, lng: 34.7667, label: 'Kakamega Forest', kind: 'place' },
    'karura': { lat: -1.2333, lng: 36.8, label: 'Karura Forest', kind: 'place' },
    'karura forest': { lat: -1.2333, lng: 36.8, label: 'Karura Forest', kind: 'place' },
    'nairobi national park': { lat: -1.3833, lng: 36.85, label: 'Nairobi National Park', kind: 'place' },
    'shimba hills': { lat: -3.3167, lng: 39.2667, label: 'Shimba Hills', kind: 'place' },
    'arabuko sokoke': { lat: -3.2, lng: 39.7, label: 'Arabuko-Sokoke', kind: 'place' },
    'chyulu hills': { lat: -2.15, lng: 37.75, label: 'Chyulu Hills', kind: 'place' },
    'tana river delta': { lat: -1.5, lng: 40.2, label: 'Tana River Delta', kind: 'place' },
    'kerio valley': { lat: 0.4167, lng: 35.2833, label: 'Kerio Valley', kind: 'place' },
    'nanyuki': { lat: 0.1856, lng: 37.0389, label: 'Nanyuki', kind: 'place' },
    'nandi hills': { lat: 0.0333, lng: 35.3, label: 'Nandi Hills', kind: 'place' },
    'rift valley': { lat: -0.1, lng: 36.0, label: 'Rift Valley', kind: 'place' },
    'western kenya': { lat: 0.5, lng: 34.3, label: 'Western Kenya', kind: 'place' },
    'northern kenya': { lat: 3.5, lng: 36.5, label: 'Northern Kenya', kind: 'place' },
    'coast': { lat: -3.5, lng: 39.5, label: 'Kenyan Coast', kind: 'place' },
    'taita hills': { lat: -3.4, lng: 38.0, label: 'Taita Hills', kind: 'place' },
    'mara': { lat: -1.4061, lng: 35.0078, label: 'Maasai Mara', kind: 'place' },
    'central kenya': { lat: -0.5, lng: 37.3, label: 'Central Kenya', kind: 'place' },
    'lake victoria basin': { lat: -0.0333, lng: 33.0, label: 'Lake Victoria Basin', kind: 'place' }
};

/**
 * Variants seen in the wild mapped onto the canonical keys above. The
 * normaliser already strips "county", "city" and "government of", so these only
 * cover genuine differences in spelling or scope.
 */
export const REGION_ALIASES = {
    nairobi: 'nairobi city',
    'mombasa county': 'mombasa',
    'murang a': 'muranga',
    murangaa: 'muranga',
    elgeyo: 'elgeyo marakwet',
    marakwet: 'elgeyo marakwet',
    tharaka: 'tharaka nithi',
    tharakapinthi: 'tharaka nithi',
    taita: 'taita taveta',
    'taita taveta county': 'taita taveta',
    transnzoia: 'trans nzoia',
    'trans nzoia county': 'trans nzoia',
    'trans nzoia 2': 'trans nzoia',
    homabay: 'homa bay',
    'homa bay county': 'homa bay',
    westpokot: 'west pokot',
    'west pokot county': 'west pokot',
    'nyandarua ndagari': 'nyandarua',
    uasingishu: 'uasin gishu',
    'uasin gishu county': 'uasin gishu',
    'tana river county': 'tana river',
    'nakuru county': 'nakuru',
    'kilifi county': 'kilifi',
    'kwale county': 'kwale',
    'lamu county': 'lamu',
    'turkana county': 'turkana',
    'wajir county': 'wajir',
    'mandera county': 'mandera',
    'marsabit county': 'marsabit',
    'isiolo county': 'isiolo',
    'garissa county': 'garissa',
    'kajiado county': 'kajiado',
    'narok county': 'narok',
    'laikipia county': 'laikipia',
    'baringo county': 'baringo',
    'bomet county': 'bomet',
    'bungoma county': 'bungoma',
    'busia county': 'busia',
    'embu county': 'embu',
    'kakamega county': 'kakamega',
    'kericho county': 'kericho',
    'kiambu county': 'kiambu',
    'kirinyaga county': 'kirinyaga',
    'kisii county': 'kisii',
    'kisumu county': 'kisumu',
    'kitui county': 'kitui',
    'machakos county': 'machakos',
    'makueni county': 'makueni',
    'meru county': 'meru',
    'migori county': 'migori',
    'nandi county': 'nandi',
    'nyamira county': 'nyamira',
    'nyeri county': 'nyeri',
    'siaya county': 'siaya',
    'vihiga county': 'vihiga',
    'samburu county': 'samburu'
};

export const KENYA_CENTROIDS = { ...COUNTY_CENTROIDS, ...PLACE_CENTROIDS };

const NOISE_TOKENS = new Set([
    'county',
    'city',
    'county government',
    'government',
    'of',
    'the',
    'republic',
    'of kenya',
    'kenya',
    'kenyan',
    'national',
    'reserved'
]);

/**
 * Reduces a free-text region to a lookup key: lower-cased, punctuation turned
 * into spaces, and administrative filler words dropped. "Nairobi County
 * Government" and "nairobi-county" both collapse to "nairobi".
 */
export const normaliseRegionKey = (value) => {
    if (typeof value !== 'string') return '';
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(' ')
        .filter((token) => token && !NOISE_TOKENS.has(token))
        .join(' ')
        .trim();
};

/**
 * Words that qualify a place without identifying it. "Lake Nakuru National
 * Park" and "Lake Nakuru" are the same point on a county-scale map, so the
 * trailing qualifier is dropped and the shorter key tried next.
 */
const GENERIC_TRAILING = new Set([
    'park',
    'parks',
    'reserve',
    'reserves',
    'sanctuary',
    'conservancy',
    'ranch',
    'game'
]);

const candidateKeys = (key) => {
    const keys = [key];
    let tokens = key.split(' ').filter(Boolean);

    while (tokens.length > 1 && GENERIC_TRAILING.has(tokens[tokens.length - 1])) {
        tokens = tokens.slice(0, -1);
        keys.push(tokens.join(' '));
    }

    return keys;
};

export const resolveRegion = (value) => {
    const key = normaliseRegionKey(value);
    if (!key) return null;

    for (const candidate of candidateKeys(key)) {
        if (KENYA_CENTROIDS[candidate]) return KENYA_CENTROIDS[candidate];
        const aliased = REGION_ALIASES[candidate];
        if (aliased && KENYA_CENTROIDS[aliased]) return KENYA_CENTROIDS[aliased];
    }

    return null;
};

/**
 * Maps a resource onto the map. An explicit `coordinates` pair always wins over
 * the region centroid so a surveyed location is never overwritten.
 */
export const toMapPoint = (resource) => {
    const lat = Number(resource?.coordinates?.lat);
    const lng = Number(resource?.coordinates?.lng);
    const withinKenya = Number.isFinite(lat) && Number.isFinite(lng)
        && lat >= -5.0 && lat <= 5.5
        && lng >= 32.0 && lng <= 42.0;

    if (withinKenya) {
        return {
            lat,
            lng,
            label: resource.region || 'Mapped location',
            kind: 'exact',
            matched: true
        };
    }

    const centroid = resolveRegion(resource?.region);
    if (!centroid) {
        return { lat: null, lng: null, label: resource?.region || '', kind: 'unresolved', matched: false };
    }

    return {
        lat: centroid.lat,
        lng: centroid.lng,
        label: centroid.label,
        kind: centroid.kind,
        matched: true
    };
};