const passport = require('passport');
const crypto = require('crypto');
const db = require('../models');
const User = db.users;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Google requires an absolute callback URL. Default to the local API origin so
// development works out of the box; set SERVER_URL in production.
const SERVER_URL = (process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, '');

// Only register the strategy when credentials are actually configured.
// `new GoogleStrategy({ clientID: undefined })` throws, which previously crashed
// the whole process during module load and made the API unbootable for anyone
// who had not set up Google OAuth.
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;

    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/api/v1/auth/google/callback`
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails && profile.emails[0] && profile.emails[0].value;
                if (!email) {
                    return done(new Error('Google account did not provide an email address.'), null);
                }

                // Check if user already exists in our DB
                let user = await User.findOne({ where: { email } });

                if (user) {
                    return done(null, user);
                }

                // Derive a collision-resistant unique username. Math.random()
                // previously gave only ~1000 possible values against a UNIQUE
                // column, so signups failed roughly once every thousand times.
                const base = ((profile.displayName || 'user')
                    .replace(/\s+/g, '')
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .slice(0, 20)) || 'user';

                user = await User.create({
                    username: `${base}${crypto.randomBytes(4).toString('hex')}`,
                    name: profile.displayName || null,
                    email,
                    // OAuth users never authenticate with a password. Store an
                    // unguessable random value rather than a fixed placeholder
                    // so no known credential can ever be used on this account.
                    password: crypto.randomBytes(32).toString('hex'),
                    role: 'user'
                });

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));

    console.log('Google OAuth strategy registered.');
} else {
    console.warn(
        'Google OAuth disabled: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env to enable it.'
    );
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
