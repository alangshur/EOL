// import custom packages
var format = require('../routes/packages.js').formatter();
var {path, fs} = require('../routes/packages.js').pathsys();

// define middleware exports to main
module.exports.middleware = function(app) {

    // GET for login: #/login
    app.get('/login', (req, res) => {
        res.sendFile(path.resolve(__dirname + './../../popper/login/login.html'));
    });
}