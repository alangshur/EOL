// init npm modules
var express = require('express');
var bodyParser = require('body-parser'); 
var helmet = require('helmet');

// init mongo database utility
var mongoUtil = require('../db/index.js').mongoUtil;

// init custom packages
var format = require('../routes/packages.js').formatter();
var {path, fs} = require('../routes/packages.js').pathsys();

// init express app with environment variables
app = express();
require('dotenv').config();

// configure middleware
app.use(express.static(path.join(__dirname, './../../popper')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());

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

// import user configuration
require('./user.js')(app, sessionSecret, databaseName, mongoUtil);

// configure PORT (default to localhost:3000)
const PORT = process.env.PORT || 3000;

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