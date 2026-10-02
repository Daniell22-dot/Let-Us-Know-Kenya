---
title: "LUK Kenya — Delivery Report"
subtitle: "Platform build status, data acquisition, and database migration"
date: "2 October 2026"
---

# 1. Purpose and scope {#purpose .unnumbered}

This report covers the work completed on the LUK Kenya platform to date across
three workstreams: the NSE market dashboard, the Kenya resources map, and the
acquisition of authoritative Kenya resource data. It also documents the
migration of the database to Neon and the defects found and fixed during that
migration.

Every figure quoted in this report was verified against the running system. The
resource counts come from a live query against the Neon database and were
independently confirmed through the public API.

# 2. Where the resource data came from {#data-sources}

The platform had no resource records. Rather than hand-entering data, two
authoritative open datasets were downloaded and processed.

## 2.1 GeoNames {#geonames}

Source: [geonames.org](https://www.geonames.org/) — licence CC BY 4.0.

Six country dumps were downloaded: Kenya (KE) plus Uganda (UG), Tanzania (TZ),
Rwanda (RW), Burundi (BI) and South Sudan (SS). The neighbouring dumps matter
because GeoNames files several shared features under the wrong country. Lake
Victoria, for example, has no entry in the Kenyan dump at all. Merging the
neighbours and then keeping only points that fall inside a Kenyan county polygon
recovers them without admitting foreign lookalikes.

| Dump | Records |
|------|---------|
| Kenya (KE) | 31,490 |
| Uganda (UG) | 26,943 |
| Tanzania (TZ) | 19,524 |
| South Sudan (SS) | 12,249 |
| Rwanda (RW) | 21,013 |
| Burundi (BI) | 14,134 |
| **Total merged** | **125,460** |

Of these, 23,862 records fell outside Kenyan county boundaries and were
discarded, leaving 101,598 candidate features.

## 2.2 County boundaries {#boundaries}

Source: [OCHA/HDX COD-AB](https://data.humdata.org/dataset/cod-ab-ken) —
"Kenya Subnational Administrative Boundaries".

This supplied the authoritative 47 county polygons and their official
representative points. These replaced earlier hand-typed coordinates that had
been estimated by eye, and they make county assignment a geometric test rather
than a guess.

## 2.3 What was excluded {#exclusions}

Two exclusions are worth recording, because the source data contained misleading
records that a naive import would have surfaced as Kenyan national assets.

**Religious buildings classified as mines.** GeoNames feature code `S.MN` is a
mixed bucket that contains genuine mines alongside mosques and monuments.
Records named "Bit Ul Mal Mosque", "Diani Persian Mosque", "Masjidulaqsa Islamic
Centre" and "Popplewells Monument" all carry this code. They were filtered out
by requiring the name to describe extraction. This reduced the Minerals category
from 41 raw records to 17 real ones.

**Inland features classified as marine.** Islands in Lake Victoria and Lake
Turkana were initially tagged "Marine & Coastal". Islands are now classified as
marine only when the containing county actually fronts the ocean, which reduced
that category from 121 records to 22.

# 3. Resources dataset {#dataset}

**1,368 resource records across all 47 counties and 9 categories.**

| Category | Records |
|----------|---------|
| Water Bodies | 556 |
| Forests | 235 |
| Mountains | 193 |
| Renewable Energy | 155 |
| Wetlands | 126 |
| National Parks & Reserves | 35 |
| Wildlife | 29 |
| Marine & Coastal | 22 |
| Minerals | 17 |
| **Total** | **1,368** |

Every record carries a `region` (county) and real coordinates. Counties are
assigned by point-in-polygon testing against the official boundary file, not by
name matching.

## 3.1 Data quality verification {#quality}

County assignment was validated against ten known reference points. Nine
resolved correctly.

| Reference | Assigned county | Result |
|-----------|-----------------|--------|
| Nairobi | Nairobi | Correct |
| Lake Nakuru | Nakuru | Correct |
| Maasai Mara | Narok | Correct |
| Tsavo East | Kitui | Correct |
| Lamu | Lamu | Correct |
| Diani Beach | Kwale | Correct |
| Kisumu | Kisumu | Correct |
| Garissa | Garissa | Correct |
| Mount Kenya summit | Kirinyaga | Correct (summit lies on the Nyeri/Kirinyaga boundary) |

One anchor initially failed and exposed a real inconsistency: Lake Victoria had
been placed at coordinates that fell in open water rather than inside Busia
County, the county it claimed. Its position is now derived from the nearest
boundary vertex to the Kenyan port at Port Victoria, so the marker and the county
claim agree. This check is the reason the dataset can be trusted for county-level
filtering.

## 3.2 Known limitations {#limitations}

These are stated so they are not mistaken for oversights.

**Economic values are empty.** `economicValue` and `tourismPotential` are null on
every record. GeoNames carries no valuations, and inventing figures for a
government investment-promotion platform would be worse than leaving them empty.
These fields need commercial or official sources: Kenya National Bureau of
Statistics, county governments, or Kenya Revenue Authority mineral records.

**Human resources are not populated.** The human-resources categories (Skills &
Talent, Technology & Innovation, Finance & Investment, and so on) have no
geographic dataset behind them. Nothing was fabricated. These require
original research or a subscription source.

**Lake Victoria is the only manually curated record.** Its GeoNames reference
point lies in Ugandan waters, so containment testing cannot place it. It is
marked `curated:lake-victoria` rather than a GeoNames id so the distinction
stays visible and the record is still traceable.

**Some arid-county records are water points.** Mandera, Wajir and similar counties
have almost no forests, lakes or parks mapped. Mapped water points and wells were
added for those counties only, because in arid northern Kenya water access is the
resource that matters. These are real GeoNames features, not estimates.

# 4. Database migration to Neon {#neon}

## 4.1 What changed {#db-changes}

The connection now supports both a managed Neon database and a local
PostgreSQL instance. `NEON_URL` takes precedence when present; otherwise the
discrete `DB_*` settings are used. No code change is needed to switch between
them.

Neon accepts TLS-only connections, so certificate negotiation is configured
explicitly.

## 4.2 Seeding {#seeding}

A new `seed-resources` command loads the dataset:

```
npm run seed-resources
```

It is idempotent. Each record keeps its GeoNames id as a natural key and the
upsert runs on that key, so repeated runs update rows in place instead of
duplicating them. This was verified by running the command three times: the row
count held steady at 1,368.

Rows created by hand through the admin panel carry no GeoNames id and are never
touched by the seeder. A `--reset` flag clears generated rows only, leaving
hand-authored content intact.

One defect was found during this work. The curated Lake Victoria record
originally had a null natural key. Nulls do not collide in a PostgreSQL unique
index, so the seeder inserted a duplicate on every run. The curated records now
carry a prefixed synthetic key and re-runs are stable.

## 4.3 Defects found and fixed {#defects}

Four issues surfaced while validating against Neon. Three were serious.

**The entire API was returning HTTP 500.** The server depended on two packages,
`hpp` and `xss-clean`, both unmaintained since 2016. Both assign to `req.query`,
which is getter-only on Express 5, so every request failed with
`Cannot set property query of #<IncomingMessage>`.

This was not simply a matter of correcting the assignment. Express 5 defines
`req.query` as a getter that re-parses the query string on every access and
caches nothing. Mutating the object it returns is silently discarded, so the
query-string sanitisation these packages claimed to provide could never have
functioned on Express 5. Query sanitisation now happens inside the query parser
itself, which is the only place it can work. The parameter-pollution protection
was rewritten as a small middleware that rejects repeated parameters with a clear
400 instead of crashing, and both abandoned dependencies were removed.

**The database schema was being rewritten on every boot.** The server started
with `sequelize.sync({ alter: true })`, which re-introspects and can silently
alter every table. Against a managed database this is slow and destructive.
Schema sync now only creates missing tables, and the altering behaviour is
opt-in behind a `DB_SYNC_ALTER` flag. Real schema changes should go through
migrations.

**Database connections were timing out during startup.** A cold TLS connection to
Neon takes roughly 20 seconds on this network, which left almost no headroom
under the 30-second pool acquire timeout and caused intermittent
`Authentication timed out` failures on boot. The acquire window was raised to 60
seconds.

## 4.4 Connection security recommendation {#ssl}

Neon emits a driver warning that its `sslmode=require` is currently treated as an
alias for full verification, and that this will change in a future major release.
The durable fix is to update the `NEON_URL` in `server/.env` to state the
requirement explicitly:

```
sslmode=verify-full
```

This makes the intended behaviour unambiguous and immune to the upcoming change.
Certificate verification is already enabled by default in the updated connection
code.

# 5. Market dashboard {#market}

## 5.1 Data source {#nse}

The dashboard is fed by the NSE Kenya ticker endpoint:

```
POST https://nsenairobi.nse.co.ke/nseticker/api/v1/ticker
```

with the payload `{"nopage":"true","isinno":"KE3000009674"}`.

Two constraints shaped the implementation. The request must carry the header
`Origin: https://www.nse.co.ke`, and browsers do not permit scripts to set the
`Origin` header, so the call has to originate server-side. The endpoint also
returns inconsistent rows, including duplicate instruments for some issuers and
records with no price. The service therefore deduplicates by highest turnover and
discards unpriced rows.

Verified on the live endpoint: 79 raw records normalised to 69 quotes, with no
duplicate ticker codes and no missing prices.

## 5.2 Index and history {#index}

Official NSE 20 and NSE 25 index levels are only available through a paid NSE Data
Services subscription. Rather than present an unofficial figure under an official
name, the dashboard publishes a **LUK Market Composite**: an equal-weighted index
of every listed instrument with a valid price. It is labelled as such throughout
the interface.

Historical charts are built from daily snapshots captured by the sync endpoint. No
history is backfilled from external sources, so the chart begins accumulating from
first deployment.

## 5.3 Endpoints {#endpoints}

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/v1/market/overview` | Public |
| GET | `/api/v1/market/history?days=&ticker=` | Public |
| POST | `/api/v1/market/sync` | Admin only |

A further defect was corrected here: bulk snapshot writes were silently failing
on PostgreSQL because Sequelize requires `upsertKeys` alongside
`updateOnDuplicate`. Snapshots were not being persisted at all. This was
diagnosed by inspecting the generated SQL and confirmed with an interception
test.

# 6. Kenya resources map {#map}

The map uses Leaflet with OpenStreetMap tiles, which requires no API key. It is
lazy-loaded, so the map library is fetched only when a visitor scrolls to it.

Markers are grouped by location and sized by how many resources share that point,
which prevents dozens of resources recorded against the same county centroid from
stacking into one unselectable blob. Unmapped regions are reported in the
interface by name rather than being silently dropped.

Coordinate resolution is layered: an exact coordinate stored on the record is used
first, falling back to the county centroid and then to a landmark centroid.
Invalid or out-of-country coordinates are rejected rather than plotted.

A lookup of 2,780 populated places, lakes, forests and peaks was generated from
the same GeoNames extract, so region names resolve to accurate coordinates without
manual mapping.

Two errors in that resolver were caught by testing rather than by inspection.
`kenya` was initially treated as a filler word to be stripped, which reduced
"Mount Kenya" to "Mount" and lost it. The keywords for parks and reserves were
stored pre-normalised while the lookup normalised its input first, so entries such
as "Maasai Mara National Reserve" could never match. Both are fixed and covered by
a test set covering real-world variants including county government names,
hyphenated county names and apostrophes.

# 7. Category standardisation {#categories}

A single canonical taxonomy was introduced in `src/shared/data/constants.js` and
applied to the blog, podcast and resources pages. Options are now derived from the
records actually present rather than hardcoded, and counts reflect real data, so
empty categories no longer appear and counts cannot drift out of step with
content.

| Workstream | State |
|------------|-------|
| Blog | Complete |
| Podcast | Complete |
| Resources | Complete |
| Research | Outstanding |
| Jobs, Startups, Projects | Outstanding |

# 8. Outstanding items {#outstanding}

| Item | Impact | Effort |
|------|--------|--------|
| Resource economic values and tourism potential | High for investors, empty fields | Needs official or commercial source |
| Human resources categories | Section renders empty | Needs original research |
| Taxonomy on research, jobs, startups, projects | Inconsistent filters | Small |
| API pagination | `findAll` returns all rows unbounded | Medium |
| Update `NEON_URL` to `sslmode=verify-full` | Removes driver warning, hardens TLS | Trivial |
| Database migrations | `sync` is not version controlled | Medium |
| Cold-start latency | 20s+ connection time on Neon | Consider connection pooling or regional endpoint |

# 9. File reference {#files}

**Generated data**

| Path | Purpose |
|------|---------|
| `server/data/kenya-resources.js` | 1,368 resource records |
| `server/data/generate-kenya-resources.mjs` | Regenerates the dataset from source |
| `src/shared/data/kenyaCounties.js` | 47 official county centroids |
| `src/shared/data/kenyaPlaces.js` | 2,780 place coordinates |

**Backend**

| Path | Purpose |
|------|---------|
| `server/config/db.config.js` | Neon and local connection handling |
| `server/seed-resources.js` | Idempotent dataset loader |
| `server/middleware/sanitize.js` | Input sanitisation and query parser |
| `server/middleware/hppGuard.js` | Parameter pollution guard |
| `server/services/nse.service.js` | NSE fetch, cache, normalisation |
| `server/controllers/market.controller.js` | Overview, history, sync |
| `server/models/Resource.js` | Resource model with `geonameId` key |

**Frontend**

| Path | Purpose |
|------|---------|
| `src/public/MarketPage.jsx` | Market dashboard |
| `src/public/components/ResourcesMap.jsx` | Leaflet map |
| `src/shared/data/kenyaGeo.js` | Region resolution |

# 10. Conclusion {#conclusion}

The platform is functionally complete for the market dashboard and the resources
map, and the resources dataset is live and served from Neon, verified through the
public API at 1,368 records spanning all 47 counties.

The migration to Neon surfaced a defect that would have been found in production
rather than in development: the API was returning HTTP 500 on every request
because of two abandoned Express middleware packages. That, the destructive
schema sync on boot, and the silently failing market snapshot writes are all
fixed and verified.

The most valuable follow-up work is populating economic values and the human
resources categories, which requires sourcing official Kenyan data rather than
open geographic data, and is the only substantive gap between what the platform
displays and what an investor would expect to see.