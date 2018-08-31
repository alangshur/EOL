/* LOGIN INDEX */

// init npm modules
const path = require('path');
const bcrypt = require('bcrypt-nodejs');
require('string-format').extend(String.prototype, {});

// init credentials utility
const credentials = require('./credentials.js');

// define middleware exports to main
module.exports = function(app, kwargs) {
    
    // GET for login: #/login
    app.get('/login', (req, res) => {
        console.log('GET Request @ /login');

        // redirect user to home if authenticated or send login html
        if (req.isAuthenticated()) {
            console.log('Redirected authenticated user to home');
            res.redirect('/home/');
            return;
        }
        else {
            res.sendFile(path.resolve(__dirname + './../../popper/login/login.html'), function(err) {
                if (err) {
                    console.log('Error sending file: login.html');
                    return;
                }

                console.log('Sent file: login.html');
            });
        }
    });

    // POST for logging in user: #/login/db
    app.post('/login/db', (req, res, next) => {
        console.log('POST Request @ /login/db');

        var username = req.body.username;
        var password = req.body.password;
        var errorMessage = credentials.validateLogin(username, password);

        // login if errorMessage is not null
        if (errorMessage) {
            res.json({
                'errorMessage': errorMessage
            });

            return;
        }

        // authenitcate logged-in user
        credentials.authenticateUser(req, res, next, kwargs);
    });

    // POST for registering user: #/register/db
    app.post('/register/db', async (req, res, next) => {
        console.log('POST Request @ /register/db');

        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var errorMessage = credentials.validateRegister(email, username, password);

        // send json response with error message if not null
        if (errorMessage) {
            res.json({
                'errorMessage': errorMessage
            });

            return;
        }

        // check if email already exists
        try {
            user = await kwargs['mongoUtil'].User().findOne({ email: email });
        }
        catch (err) {
            return console.log('Registration error: {}'.format(err));
        }

        if (user) {
            res.json({
                'errorMessage': 'Email has already been registered'
            });

            return;
        }

        // check if username already exists
        try {
            var user = await kwargs['mongoUtil'].User().findOne({ username: username });
        }
        catch (err) {
            return console.log('Registration error: {}'.format(err));
        }

        if (user) {
            res.json({
                'errorMessage': 'Username already exists'
            });

            return;
        }
        
        // set salt rounds to constant (hash cost = 2^rounds)
        const saltRounds = process.env['SALT_ROUNDS_{}'.format(process.env.STATE)];

        // generate hash salt with saltRounds
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) {
                return console.log('Registration error: {}'.format(err));
            }

            // hash plaintext password with salt
            bcrypt.hash(password, salt, null, async function(err, hash) {
                if (err) {
                    return console.log('Registration error: {}'.format(err));
                }

                // register user
                await kwargs['mongoUtil'].User().insertOne({
                    'email': email,
                    'username': username,
                    'password': hash
                }, 
                function(err) {
                    if (err) {
                        return console.log('Registration error: {}'.format(err));
                    }

                    console.log('Registration Success: \"{}\"'.format(username));
                });

                // authenticate registered user
                credentials.authenticateUser(req, res, next, kwargs);
            });
        });
    });
}