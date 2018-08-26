/* HOME INDEX */

// init npm modules
const path = require('path');

// define middleware exports to main
module.exports = function(app, kwargs) {

    // GET for main: #/main
    app.get('/home', (req, res) => {
        console.log('GET Request @ /home');

        res.sendFile(path.resolve(__dirname + './../../popper/home/home.html'));
    });
}