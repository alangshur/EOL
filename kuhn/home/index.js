// define middleware exports to main

module.exports.middleware = function(app) {

    // GET for main: #/main
    app.get('/home', (req, res) => {
        console.log('GET Request @ /main');

        res.send('EOL Main');
    });
}