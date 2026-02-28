const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../models');
const User = db.users;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists in our DB
            let user = await User.findOne({ where: { email: profile.emails[0].value } });

            if (user) {
                return done(null, user);
            }

            // If not, create a new user
            user = await User.create({
                username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
                name: profile.displayName,
                email: profile.emails[0].value,
                password: 'oauth-login', // Placeholder
                role: 'user'
            });

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

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
