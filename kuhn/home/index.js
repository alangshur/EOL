/* HOME INDEX */

// init npm modules
const path = require('path');
require('string-format').extend(String.prototype, {});

// define middleware exports to main
module.exports = function(app, kwargs) {

    // GET for home: #/home
    app.get('/home', (req, res) => {
        console.log('GET Request @ /home');

        res.sendFile(path.resolve(__dirname + './../../popper/home/home.html'), function(err) {
            if (err) {
                console.log('Error sending file: home.html');
                return;
            }

            console.log('Sent file: home.html');
        });
    });

    // GET for spot: #/spot
    app.get('/spot', (req, res) => {

        // get spot data
        try {
            kwargs['mongoUtil'].Spot().find({}).toArray(function(err, result) {
                if (err) throw err;

                // send JSON response
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
            });
        }
        catch (err) {
            return console.log('Error fetching spots from db: {}'.format(err));
        }
    });

    // POST for spot: #/spot
    app.post('/spot', (req, res) => {

        // add spot to mongo collection
        kwargs['mongoUtil'].Spot().insertOne(req.body, function(err, res) {
            if (err) {
                console.log('Error posting spot to db: {}'.format(err));
                return;
            }

            console.log('Successfully posted spot {} to db'.format(req.body.spotId));
        });
    });
}