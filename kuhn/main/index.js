// init npm modules
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');
const http = require('http');
const https = require('https');
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

     // base GET: #/
     app.get('/', (req, res, next) => {     

        // redirect user to home if authenticated and login if otherwise
        if (req.isAuthenticated()) {
            res.redirect('/home');
        }
        else {
            res.redirect('/login');
        }
    });
});

// connect to EOL instance on PORT
const PORT = process.env.PORT || 3000;

// get https private key and certificate 
const privateKey = fs.readFileSync(path.join(__dirname, process.env.PRIVATE_KEY_ROUTE), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, process.env.CERTIFICATE_ROUTE), 'utf8');

if (process.env.PROTOCOL == 'HTTP') {

    // run http server 
    http.createServer(app).listen(PORT, () => {
        console.log('EOL {} instance (HTTP) running on port {}'.format(process.env.STATE, PORT));
    });
}
else if (process.env.PROTOCOL == 'HTTPs') {
    
    // run https server
    https.createServer({
        key: privateKey, 
        cert: certificate,
        passphrase: process.env.PEM_PASS_PHRASE
    }, app).listen(PORT, () => {
        console.log('EOL {} instance (HTTPS) running on port {}'.format(process.env.STATE, PORT));
    });
}