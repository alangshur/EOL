// define middleware exports to main
module.exports.middleware = function(app, kwargs) {

    // GET for main: #/main
    app.get('/home', (req, res) => {
        console.log('GET Request @ /home');

        res.sendFile(kwargs['path'].resolve(__dirname + './../../popper/home/home.html'));
    });
}