const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');

// Connect to mongoose
mongoose.connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    });
let db = mongoose.connection;

// Bring in model
const Article = require('./models/article');

// Check connection
db.once('open', () => {
    console.log("Connected to MongoDB");
})

// Check for db errors
db.on('error', (err) => {
    console.log(err);
});

// Init app
const app = express();

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUnitialized: true
}));

// Set express messages middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
})

// Set express validator middleware
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        let namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while (namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Home route
app.get('/', (req, res) => {
   Article.find({}, (err, articles) => {
        if (err) {
           console.log(err);
        }
        res.render('index', {
            title: 'Articles',
            articles: articles
        });
    });
});

// Route files
const articles = require('./routes/articles.js');
app.use('/articles', articles)

let users = require('./routes/users.js');
app.use('/users', users);

app.listen(3000, () => {
    console.log('Server started on port 3000....');
});