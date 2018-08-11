// init npm modules
var path = require('path');
require('string-format').extend(String.prototype, {});

// init login packages
var credentials = require('./credentials.js');

// define middleware exports to main
module.exports.middleware = function(app, passport) {

    // GET for login: #/login
    app.get('/login', (req, res) => {
        console.log('GET Request @ /login');

        res.sendFile(path.resolve(__dirname + './../../popper/login/login.html'));
    });

    // POST for loging in user: #/login/db
    app.post('/login/db', (req, res, next) => {
        console.log('POST Request @ /login/db');

        var username = req.body.username;
        var password = req.body.password;
        var errorMessage = credentials.validateLogin(username, password);

        // login if errorMessage is null
        if (errorMessage) {
            res.json({
                'errorMessage': errorMessage
            });

            return;
        }

        passport.authenticate('local', function(err, user, info) {
            req.login(user, function(err) {

                // redirect home if user is authenticated
                if (req.isAuthenticated()) {

                    // trigger HTTP 303 (not 302)
                    res.redirect(303, '/home');
                }
                else {

                    // send json response with error message if user is not authenticated
                    res.json({
                        'errorMessage': errorMessage
                    });
                }
            });
        })(req, res, next);
    });

    // POST for registering user: #/register/db
    app.post('/register/db', (req, res) => {
        console.log('POST Request @ /register/db');

        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var errorMessage = credentials.validateRegister(email, username, password);

        res.json({
            'errorMessage': errorMessage
        });
    });
}