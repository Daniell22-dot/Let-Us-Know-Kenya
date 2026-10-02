/**
 * Input sanitisation.
 *
 * Replaces the `xss-clean` package (unmaintained since 2016). It assigned to
 * `req.query`, which is getter-only on Express 5, so every request failed with
 * "Cannot set property query of #<IncomingMessage>" and the whole API returned
 * 500.
 *
 * There is a second problem that fixing the assignment alone would have hidden:
 * Express 5 defines `req.query` as a getter that re-parses the query string on
 * every access and caches nothing. Mutating the object it returns is therefore
 * silently discarded, so a middleware can never sanitise the query string after
 * the fact. The only place it can be sanitised is inside the parser itself,
 * which is why `buildQueryParser` below is wired into `app.set('query parser')`.
 *
 * This is defence in depth, not the primary control. The real protections are
 * parameterised SQL (Sequelize binds parameters) and React's default output
 * escaping on the frontend. Escaping `<`/`>` here means a payload that reaches a
 * log line, a notification or an admin email is inert.
 */

const qs = require('qs');

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_UNSAFE = /[&<>"']/g;

const HTML_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

const escapeChar = (match) => HTML_ENTITIES[match];

/**
 * Escapes a single string value.
 * @param {string} value
 * @returns {string}
 */
function escapeString(value) {
    return value
        .replace(CONTROL_CHARS, '')
        .replace(HTML_UNSAFE, escapeChar);
}

/**
 * Recursively escapes every string inside a value. Objects and arrays are
 * mutated in place and returned so the call can be used either way.
 * @template T
 * @param {T} value
 * @returns {T}
 */
function sanitizeTree(value) {
    if (typeof value === 'string') return /** @type {T} */ (escapeString(value));

    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i += 1) value[i] = sanitizeTree(value[i]);
        return value;
    }

    if (value && typeof value === 'object') {
        // Dates, Buffers and similar are left alone: they are not user text and
        // coercing them would corrupt the value.
        if (value instanceof Date || Buffer.isBuffer(value)) return value;

        for (const key of Object.keys(value)) {
            // Prototype-pollution guard. qs already strips __proto__ by default,
            // but this runs on body too, which is parsed by body-parser.
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                delete value[key];
                continue;
            }
            value[key] = sanitizeTree(value[key]);
        }
        return value;
    }

    return value;
}

/**
 * Query parser for Express 5. Sanitisation has to happen here rather than in a
 * middleware because the `req.query` getter re-parses on each access.
 * @param {string} str
 */
function buildQueryParser() {
    return function queryParser(str) {
        try {
            return sanitizeTree(qs.parse(str));
        } catch (_) {
            // A malformed query string should not crash the request.
            return Object.create(null);
        }
    };
}

/**
 * Express middleware sanitising the parts of the request that are real,
 * assignable properties: the parsed body and the route params.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function sanitizeRequest(req, res, next) {
    if (req.body && typeof req.body === 'object') sanitizeTree(req.body);
    if (req.params && typeof req.params === 'object') sanitizeTree(req.params);
    next();
}

module.exports = sanitizeRequest;
module.exports.buildQueryParser = buildQueryParser;
module.exports.escapeString = escapeString;
module.exports.sanitizeTree = sanitizeTree;