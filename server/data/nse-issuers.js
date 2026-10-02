const DEFAULT_SECTOR = 'Other';

// Seed metadata for the NSE ticker feed. The feed publishes codes and prices
// only, so names and sectors are maintained here. Anything not listed is
// classified as "Other" on purpose: a wrong sector label on a public dashboard
// is worse than an honest gap that an administrator can fill in later.
const ISSUERS = {
    ABSA: { name: 'ABSA Bank Kenya', sector: 'Banking' },
    ARM: { name: null, sector: 'Manufacturing & Allied' },
    BAT: { name: 'British American Tobacco Kenya', sector: 'Manufacturing & Allied' },
    BAMB: { name: 'Bamburi Cement', sector: 'Manufacturing & Allied' },
    BRIT: { name: 'Britam Holdings', sector: 'Insurance' },
    CARB: { name: 'Car & General (Kenya)', sector: 'Manufacturing & Allied' },
    CIC: { name: 'CIC Insurance Group', sector: 'Insurance' },
    COOP: { name: 'Co-operative Bank of Kenya', sector: 'Banking' },
    DTK: { name: 'Diamond Trust Bank Kenya', sector: 'Banking' },
    EABL: { name: 'East African Breweries', sector: 'Manufacturing & Allied' },
    EQTY: { name: 'Equity Group Holdings', sector: 'Banking' },
    HAFR: { name: 'Home Afrika', sector: 'Real Estate & Construction' },
    HFCB: { name: null, sector: 'Banking' },
    HFCK: { name: 'Housing Finance Company of Kenya', sector: 'Banking' },
    IMH: { name: 'I&M Group', sector: 'Banking' },
    JUB: { name: 'Jubilee Holdings', sector: 'Insurance' },
    KCB: { name: 'KCB Group', sector: 'Banking' },
    KPLC: { name: 'Kenya Power', sector: 'Electricity & Utilities' },
    KQ: { name: 'Kenya Airways', sector: 'Transport & Logistics' },
    NBK: { name: 'National Bank of Kenya', sector: 'Banking' },
    NCBA: { name: 'NCBA Group', sector: 'Banking' },
    NMG: { name: 'Nation Media Group', sector: 'Retail & Consumer' },
    NSE: { name: null, sector: 'Investment & Finance' },
    OCH: { name: null, sector: 'Insurance' },
    PORT: { name: 'Kenya Ports Authority', sector: 'Transport & Logistics' },
    SCAN: { name: 'Stanbic Holdings Kenya', sector: 'Investment & Finance' },
    SCBK: { name: 'Standard Chartered Bank Kenya', sector: 'Banking' },
    SCOM: { name: 'Standard Chartered Group Kenya', sector: 'Banking' },
    TPSE: { name: null, sector: 'Manufacturing & Allied' },
    TOTL: { name: null, sector: 'Energy & Petroleum' },
    UCHM: { name: 'Uchumi Insurance', sector: 'Insurance' },
    UNGA: { name: 'Unga Group', sector: 'Manufacturing & Allied' },
    XPRS: { name: null, sector: 'Transport & Logistics' }
};

const getIssuerMeta = (ticker) => {
    const code = typeof ticker === 'string' ? ticker.trim().toUpperCase() : '';
    const meta = ISSUERS[code];
    return {
        ticker: code,
        name: meta?.name || code,
        sector: meta?.sector || DEFAULT_SECTOR
    };
};

const knownTickers = () => Object.keys(ISSUERS);

module.exports = {
    ISSUERS,
    DEFAULT_SECTOR,
    getIssuerMeta,
    knownTickers
};