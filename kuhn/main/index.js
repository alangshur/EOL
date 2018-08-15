// init npm modules
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const bcrypt = require('bcrypt-nodejs');
require('string-format').extend(String.prototype, {});

// init express app with environment variables
app = express();
require('dotenv').config();

// init mongo database utility
const mongoUtil = require('./db.js').mongoUtil;

// configure universal middleware constants
const state = process.env.STATE;
const sessionSecret = process.env['SESSION_SECRET_{}'.format(state)];
const databaseName = process.env['DATABASE_NAME_{}'.format(state)];

// configure universal app middleware
app.use(express.static(path.join(__dirname, './../../popper')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(sessionSecret));
app.use(helmet());

// connect db with callback for database-dependent tasks
mongoUtil.connect(databaseName, function() {
    console.log('Mongo DB ({}) database connected'.format(state));

    // setup user and import passport configuration
    const passport = require('./user.js')(app, sessionSecret, databaseName, mongoUtil);

    // import middleware from all features (pass necessary modules)
    require('./routes.js').middlewareFunctions(app, {
        'passport': passport,
        'mongoUtil': mongoUtil,
        'path': path,
        'bcrypt': bcrypt,
        'string-format': () => {
            require('string-format').extend(String.prototype, {});
        }
    });
});

// connect to EOL instance on PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('EOL {} instance running on port {}'.format(process.env.STATE, PORT));
});