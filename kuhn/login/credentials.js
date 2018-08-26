/* CREDENTIALS UTILITY (EXPORTED AS FUNCTION) */

// init npm modules
require('string-format').extend(String.prototype, {});

// export credentials functions
module.exports = {

    // authenticate req user for login and regestration
    authenticateUser: function(req, res, next, kwargs) {
        kwargs['passport'].authenticate('local', function(err, user, info) {
            req.login(user, function(err) {

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
    },

    // validate login credentials
    validateLogin: function(username, password) {
        if (!username || !password) {
            return 'Please specify a username and password';
        }

        return null;
    },

    // validate registration credentials
    validateRegister: function(email, username, password) {
        if (!email || !username || !password) {
            return 'Please specify an email, username, and password';
        }

        // check email credential
        if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email))) {
            return 'Please enter a valid email address'
        }
        
        // check username credential
        if (!(/^.{4,128}$/.test(password))) {
            return 'Username must be greater than 3 characters in length';
        }

        // check password credential
        if (!(/^.{4,128}$/.test(password))) {
            return 'Password must be greater than 3 characters in length';
        }
        
        return null;
    }
}