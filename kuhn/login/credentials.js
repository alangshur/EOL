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

        // check username credential

        // check password credential
        if (!(/^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{4,128}$/.test(password))) {
            return 'Password must be greater than 4 characters in length and contain one letter, number, and special character';
        }
        
        return null;
    }
}