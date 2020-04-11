const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

let User = require('../models/user');

// Register form
router.get('/register', (req, res) => {
    res.render('register');
});

// Register process
router.post('/register', (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('confirmPassword', 'Password do not match').equals(password);

    let errors = req.validationErrors();
    if (errors){
        res.render('register', {
            errors: errors
        });
    }
    else {
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        bcrypt.genSalt(10, (err, salt) => {
            if (err) console.log(err);
            
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) console.log(err);
                
                newUser.password = hash;
                newUser.save((err) => {
                    if (err) console.log(err);
                    else {
                        req.flash('success', 'You are now registered and can login');
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }
});


// Login form
router.get('/login', (req, res) => {
    res.render('login');
});

// Login process
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
})

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
})


module.exports = router;