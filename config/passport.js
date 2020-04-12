const localStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = (passport) => {
    // Local strategy
    passport.use(new localStrategy((username, password, done) => {
        // match username
        let query = {
            username: username
        };

        User.findOne(query, (err, user) => {
            if (err) throw err;
            if (!user) return done(null, false, { message: "No user found" });

            // match password
            
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) return done(null, user);
                else return done(null, false, { message: "Wrong password" });
            });
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}