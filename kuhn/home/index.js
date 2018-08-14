// define middleware exports to main

module.exports.middleware = function(app) {

    // GET for main: #/main
    app.get('/home', (req, res) => {
        res.send('EOL Main');
    });
}