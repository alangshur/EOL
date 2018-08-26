/* MAIN INDEX */

// init npm modules
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('string-format').extend(String.prototype, {});

// init express app with environment variables
app = express();
require('dotenv').config();

// init db utility
const mongoUtil = require('./db.js');

// configure universal middleware constants
const state = process.env.STATE;
const protocol = process.env.PROTOCOL;
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

    // init user utility (with kwargs)
    const passport = require('./user.js')(app, {
        'sessionSecret': sessionSecret,
        'databaseName': databaseName,
        'mongoUtil': mongoUtil
    });

    // handle authentication on all routes
    app.all('/*', (req, res, next) => {  
        const unauthenticatedRoutes = new Set(['/login/', '/login/db', '/register/db']);
        
        if (req.isAuthenticated() || unauthenticatedRoutes.has(req.path)) {
            next();
            return;
        }
        else {
            console.log('Redirected unauthenticated user to login');
            res.redirect('/login');
        }
    });

    // base GET: #/
    app.get('/', (req, res) => {     
        console.log('GET Request @ /')

        // redirect user to home if authenticated and login if otherwise
        if (req.isAuthenticated()) {
            res.redirect('/home');
        }
        else {
            res.redirect('/login');
        }
    });

    // init boostrap utility (with kwargs)
    require('./bootstrap.js')(app, {
        'passport': passport,
        'mongoUtil': mongoUtil
    });
});

// connect to EOL instance on PORT
const PORT = process.env.PORT || 3000;

// run http server 
if (protocol == 'HTTP') {
    http.createServer(app).listen(PORT, () => {
        console.log('EOL {} instance (HTTP) running on port {}'.format(process.env.STATE, PORT));
    });
}
 
// run https dev server (self-signed CA)
else if (protocol == 'HTTPS' && state == 'DEV') {
    
    // get https private key and certificate 
    const privateKey = fs.readFileSync(path.join(__dirname, process.env.PRIVATE_KEY_ROUTE), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, process.env.CERTIFICATE_ROUTE), 'utf8');

    // run https server
    https.createServer({
        key: privateKey, 
        cert: certificate,
        passphrase: process.env.PEM_PASS_PHRASE
    }, app).listen(PORT, () => {
        console.log('EOL {} instance (HTTPS) running on port {}'.format(process.env.STATE, PORT));
    });
}

// run https prod server
else if (protocol == 'HTTPS' && state == 'PROD') {
    // TODO: implement prod https server
}
