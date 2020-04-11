const express = require('express');
const router = express.Router();

// Article model
const Article = require('../models/article');

// User model
const User = require('../models/user');

// Load edit form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (article.author != req.user._id){
            req.flash('danger', 'Cannot edit this article');
            res.redirect('/');
        }
        else{
            res.render('edit_article', {
                title: 'Edit Article',
                article: article
            });   
        }
    });
})

// Edit post route
router.post("/edit/:id", (req, res) => {
    let article = {
        title: req.body.title,
        author: req.user._id,
        body: req.body.body
    };

    let query = {_id: req.params.id};

    Article.update(query, article, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});

// Add route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_article', {
        title: 'Add article'
    });
});

// Add submit POST route
router.post('/add', (req, res) => {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get errors
    let errors = req.validationErrors();
    if (errors){
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    }
    else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save((err) => {
            if (err) {
                console.log(err);
                return;
            }
            else {
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }
});

// Delete article
router.delete('/:id', (req, res) => {
    if (!req.user._id) res.status(500).send();
    
    let query = {_id: req.params.id};
    
    Article.findById(req.params.id, (err, article) => {
        if (article.author != req.user._id) res.status(500).send();
        else{
            Article.remove(query, (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.send('Success');
                }
            });
        }
    });
});

// Get single article
router.get("/:id", (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, (err, user) => {
            if (err) throw err;
            else{
                res.render('article', {
                    article: article,
                    author: user.name
                });
            }
        });
    });
});

// access control
function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()) return next();
    else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
};

module.exports = router;