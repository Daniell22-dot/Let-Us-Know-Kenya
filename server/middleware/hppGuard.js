/**
 * HTTP Parameter Pollution guard.
 *
 * Replaces the `hpp` package, which has been unmaintained since 2016 and
 * assigns to `req.query`. That property is getter-only on modern Node, so the
 * middleware threw "Cannot set property query of #<IncomingMessage>" and turned
 * every request into a 500.
 *
 * The protection it provided is still worth having. Given `?role=admin&role=user`
 * Express deliberately builds `role: ['admin', 'user']` rather than letting the
 * last value silently win, and an array in place of a string is what catches
 * confused-deputy bugs downstream. This guard makes that rejection explicit and
 * returns a clear 400 instead of letting a broken string reach a query.
 */

/** Query keys that are legitimately allowed to repeat. */
const ALLOW_LIST = new Set(['sort', 'order', 'fields', 'include', 'tags']);

const isPlainQueryValue = (value) =>
    value === null || ['string', 'number', 'boolean'].includes(typeof value);

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
module.exports = function hppGuard(req, res, next) {
    const offenders = [];

    for (const [key, value] of Object.entries(req.query || {})) {
        if (ALLOW_LIST.has(key)) continue;
        if (!Array.isArray(value) && isPlainQueryValue(value)) continue;
        offenders.push(key);
    }

    if (offenders.length === 0) return next();

    return res.status(400).json({
        message: 'Invalid query parameter',
        detail: `Repeated or structured values are not accepted for: ${offenders.join(', ')}`
    });
};

module.exports.ALLOW_LIST = ALLOW_LIST;