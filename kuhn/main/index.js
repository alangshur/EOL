// init npm modules
var express = require('express');
var bodyParser = require('body-parser'); 
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var path = require('path');
require('string-format').extend(String.prototype, {});

// init mongo database utility
var mongoUtil = require('./db.js').mongoUtil;

// init express app with environment variables
app = express();
require('dotenv').config();

// configure universal middleware
const state = process.env.STATE;
const sessionSecret = process.env['SESSION_SECRET_{}'.format(process.env.STATE)];
const databaseName = process.env['DATABASE_NAME_{}'.format(process.env.STATE)];

app.use(express.static(path.join(__dirname, './../../popper')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(sessionSecret));
app.use(helmet());

// connect db with callback for database-dependent tasks
mongoUtil.connect(databaseName, function() {
    console.log('Mongo DB ({}) database connected'.format(state));

    // import passport configuration
    var passport = require('./user.js')(app, sessionSecret, databaseName, mongoUtil);

    // import middleware from all features
    require('./routes.js').middlewareFunctions(app, passport);
});

// connect to EOL instance on PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('EOL {} instance running on port {}'.format(process.env.STATE, PORT));
});