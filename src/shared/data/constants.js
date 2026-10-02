export const ALL_OPTION = 'All';

export const CONTENT_CATEGORIES = [
    'Innovation',
    'Technology',
    'Artificial Intelligence',
    'Business',
    'Finance & Markets',
    'Agriculture',
    'Infrastructure',
    'Energy',
    'Environment & Climate',
    'Conservation & Biodiversity',
    'Health',
    'Education',
    'Tourism',
    'Culture',
    'Sports',
    'Governance & Policy',
    'Gender & Youth',
    'Manufacturing',
    'Transport & Logistics',
    'Real Estate'
];

export const JOB_CATEGORIES = [
    'Technology',
    'Artificial Intelligence',
    'Innovation',
    'Business',
    'Finance & Markets',
    'Agriculture',
    'Infrastructure',
    'Energy',
    'Environment & Climate',
    'Health',
    'Education',
    'Tourism',
    'Culture',
    'Manufacturing',
    'Transport & Logistics'
];

export const RESOURCE_CATEGORIES = {
    natural: [
        'National Parks & Reserves',
        'Wildlife',
        'Forests',
        'Marine & Coastal',
        'Water Bodies',
        'Wetlands',
        'Mountains',
        'Minerals',
        'Renewable Energy'
    ],
    human: [
        'Skills & Talent',
        'Technology & Innovation',
        'Entrepreneurship',
        'Finance & Investment',
        'Infrastructure',
        'Education & Training',
        'Healthcare Workforce'
    ]
};

export const PROJECT_CATEGORIES = [
    'Conservation & Biodiversity',
    'Environment & Climate',
    'Technology',
    'Innovation',
    'Agriculture',
    'Infrastructure',
    'Energy',
    'Health',
    'Education'
];

export const MARKET_SECTORS = [
    'Banking',
    'Insurance',
    'Investment & Finance',
    'Telecommunications & Technology',
    'Energy & Petroleum',
    'Manufacturing & Allied',
    'Retail & Consumer',
    'Healthcare',
    'Agriculture',
    'Tourism',
    'Real Estate & Construction',
    'Transport & Logistics',
    'Electricity & Utilities',
    'Exchange Traded Fund',
    'Other'
];

export const SECTOR_COLORS = {
    Banking: '#1e293b',
    Insurance: '#334155',
    'Investment & Finance': '#c41e3a',
    'Telecommunications & Technology': '#e11d48',
    'Energy & Petroleum': '#f59e0b',
    'Manufacturing & Allied': '#7c3aed',
    'Retail & Consumer': '#0891b2',
    Healthcare: '#059669',
    Agriculture: '#65a30d',
    Tourism: '#db2777',
    'Real Estate & Construction': '#b45309',
    'Transport & Logistics': '#4f46e5',
    'Electricity & Utilities': '#0ea5e9',
    'Exchange Traded Fund': '#64748b',
    Other: '#94a3b8'
};

export const getSectorColor = (sector) => SECTOR_COLORS[sector] || SECTOR_COLORS.Other;

const normalise = (value) => (typeof value === 'string' ? value.trim() : '');

export const uniqueStrings = (values) =>
    Array.from(new Set(values.map(normalise).filter(Boolean)));

/**
 * Builds the option list for a category filter.
 * Canonical categories keep their declared order and only appear when the
 * loaded records actually use them, so empty filters never clutter the UI.
 * Any legacy value not in the canonical list is appended instead of being
 * dropped, which keeps older records reachable.
 */
export const buildCategoryOptions = (observed, canonical = CONTENT_CATEGORIES) => {
    const observedSet = new Set(uniqueStrings(observed));
    const ordered = canonical.filter((category) => observedSet.has(category));
    const extras = Array.from(observedSet)
        .filter((category) => !canonical.includes(category))
        .sort((a, b) => a.localeCompare(b));

    return [ALL_OPTION, ...ordered, ...extras];
};

export const countByCategory = (records, categoryKey = 'category') => {
    const counts = new Map();

    records.forEach((record) => {
        const category = normalise(record?.[categoryKey]);
        if (!category) return;
        counts.set(category, (counts.get(category) || 0) + 1);
    });

    return counts;
};