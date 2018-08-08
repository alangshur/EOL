// init npm modules
var express = require('express');
var bodyParser= require('body-parser'); 

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var crypto = require('crypto');
var uuid = require('uuid');

var helmet = require('helmet');
var envConfig = require('dotenv').config();

// init mongo database utility
var mongoUtil = require('../db/index.js').mongoUtil;

// init custom packages
var format = require('../routes/packages.js').formatter();
var {path, fs} = require('../routes/packages.js').pathsys();

// init express app
app = express();

// get appropriate session secret and connect mongo
switch(process.env.STATE) {
    case 'PROD':
        var sessionSecret = process.env.SESSION_SECRET_PROD;
        var databaseName = process.env.DATABASE_PROD_NAME;

        mongoUtil.connect(databaseName, function() {
            console.log('Mongo DB (PROD) database connected');
        });

        break; 
    case 'DEV':
        var sessionSecret = process.env.SESSION_SECRET_DEV;
        var databaseName = process.env.DATABASE_DEV_NAME;

        mongoUtil.connect(databaseName, function() {
            console.log('Mongo DB (DEV) database connected');
        });

        break; 
}

// configure app npm modules
app.use(express.static(path.join(__dirname, './../../popper')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

// configure user session
app.use(session({
    genid: (req) => {
        const sessionHash = crypto.createHash('sha256').update(uuid.v1()).update(crypto.randomBytes(256)).digest('hex');
        console.log('New session with ID: {}'.format(sessionHash));

        return sessionHash;
    },

    // get specified session secret
    secret: sessionSecret,

    // persist sessions past cookies and memory cache
    store: new MongoStore({ url: mongoUtil.formatURI(databaseName) }),
    resave: false,
    saveUninitialized: true
}));

// configure port (default to localhost:3000)
const PORT = process.env.PORT || 3000;

// set app to listen on PORT (http npm module deprecated)
app.listen(PORT, () => {
    console.log('EOL {} instance running on port {}'.format(process.env.STATE, PORT));
});

// import middleware from all features
require('../routes/index.js').middlewareFunctions(app);

// GET for default: #/
app.get('/', (req, res) => {
    var response = {
        msg: process.env.TEST_MSG
    };

    res.json(response);
});