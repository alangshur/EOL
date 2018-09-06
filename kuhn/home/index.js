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
            console.log('Error fetching spots from db: {}'.format(err));
            res.end();
        }
    });

    // POST for spot: #/spot
    app.post('/spot', (req, res) => {

        // add spot to mongo collection
        try {
            kwargs['mongoUtil'].Spot().insertOne(req.body, function(err) {
                if (err) throw err;
    
                console.log('Successfully posted spot {} to db'.format(req.body.spotId));
            });
        }
        catch (err) {
            console.log('Error posting spot to db: {}'.format(err));
        }

        res.end();
    });

    // POST for spot info: #/spot/info
    app.post('/spot/info', (req, res) => {

        // get spot data for specific spot
        try {
            kwargs['mongoUtil'].Spot().find({
                spotId: req.body.spotId
            }).toArray(function(err, result) {
                if (err) throw err;

                // send JSON response
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
            });
        }
        catch (err) {
            console.log('Error fetching spot {} from db: {}'.format(req.body.spotId, err));
            res.end();
        }
    });
}