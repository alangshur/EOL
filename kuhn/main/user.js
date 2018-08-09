module.exports = function(app, sessionSecret, databaseName, mongoUtil) {
    
    // init npm modules
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var uuid = require('uuid');
    var crypto = require('crypto');
    var session = require('express-session');
    var MongoStore = require('connect-mongo')(session);

    // configure middleware
    app.use(passport.initialize());
    app.use(passport.session());

    // configure user session middleware
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

    // import passport configuration
    require('./../login/index').passportConfig(passport, LocalStrategy);
}