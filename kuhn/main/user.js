module.exports = function(app, sessionSecret, databaseName, mongoUtil) {
    
    // init npm modules
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var uuid = require('uuid');
    var crypto = require('crypto');
    var session = require('express-session');
    var MongoStore = require('connect-mongo')(session);
    var ObjectID = require('mongodb').ObjectID;

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

    // configure passport middleware
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(async function(username, password, done) {  
        try {
            var user = await mongoUtil.User().findOne({ username: username });
        }
        catch (err) {
            return done(err, false, { message: 'Error authenticating user {}'.format(err) });
        }

        // check if db query returned user
        if (!user) {
            return done(null, false, { message: 'Username is not registered' });
        }

        // validate user if not null
        else {

            // check for correct password
            if (user.password != password) {
                return done(null, false, { message: 'Password does not match username' });
            }

            return done(null, user, { message: 'User \"{}\" successfully authenticated'.format(username) });
        }
    }));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(async function(id, done) {
        try {
            var user = await mongoUtil.User().findOne({ _id: new ObjectID(id) });
        }
        catch (err) {
            console.log('Error deserializing user: {}'.format(err));
            return done(null, false);
        }
        
        if (!user) {
            return done(null, false);
        }
        else {
            return done(null, user);
        }
    });

    return passport;
}