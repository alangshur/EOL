// init login packages
const credentials = require('./credentials.js');

// define authentication function for login and registration
function authenticateUser(req, res, next, kwargs) {
    kwargs['string-format']();

    kwargs['passport'].authenticate('local', function(err, user, info) {
        if (err) {
            return console.log('Authentication error: {}'.format(info.message || err));
        }

        req.login(user, function(err) {
            if (err) {
                return console.log('Authentication error: {}'.format(info.message || err));
            }

            // handle authentication success 
            if (req.isAuthenticated()) {
                console.log('Authentication sucess: {}'.format(info.message));

                // send json success response (null error message)
                res.json({
                    'errorMessage': null
                });
            }

            // handle authentication failure
            else {
                console.log('Authentication failure: {}'.format(info.message));

                // send json response with authentication failure message
                res.json({
                    'errorMessage': info.message
                });
            }
        });
    })(req, res, next);
}

// define middleware exports to main
module.exports.middleware = function(app, kwargs) {
    kwargs['string-format']();

    // GET for login: #/login
    app.get('/login', (req, res, next) => {
        console.log('GET Request @ /login');

        res.sendFile(kwargs['path'].resolve(__dirname + './../../popper/login/login.html'));
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

        // authenitcate logged-in user
        authenticateUser(req, res, next, kwargs);
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

        /* -- HASH PASSWORD -- */
        
        // set salt rounds to constant (hash cost = 2^rounds)
        const saltRounds = process.env['SALT_ROUNDS_{}'.format(process.env.STATE)];
        var passwordHash = null;

        // generate hash salt with saltRounds
        kwargs['bcrypt'].genSalt(saltRounds, function(err, salt) {
            if (err) {
                return console.log('Registration error: {}'.format(err));
            }

            // hash plaintext password with salt
            kwargs['bcrypt'].hash(password, salt, null, async function(err, hash) {
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
                authenticateUser(req, res, next, kwargs);
            });
        });
    });
}