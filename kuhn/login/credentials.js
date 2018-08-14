module.exports = {

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