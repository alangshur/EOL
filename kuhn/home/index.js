/* HOME INDEX */

// init npm modules
const path = require('path');
const uuid = require('uuid');
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
        console.log('GET Request @ /spot');

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
        console.log('POST Request @ /spot');

        // create spot id
        const spotId = 'spot-{}'.format(uuid.v1());

        // create complete spot object
        const spotObj = Object.assign({
            spotId: spotId
        }, req.body);

        // add spot to mongo collection
        try {
            kwargs['mongoUtil'].Spot().insertOne(spotObj, function(err) {
                if (err) throw err;
    
                console.log('Successfully posted spot {} to db'.format(spotId));

                // send JSON response
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(spotObj));
            });
        }
        catch (err) {
            console.log('Error posting spot to db: {}'.format(err));
            res.end();
        }
    });

    // GET for spot info: #/spot/info
    app.get('/spot/info', (req, res) => {
        console.log('GET Request @ /spot/info');

        // get spot data for specific spot
        try {
            kwargs['mongoUtil'].Spot().find({
                spotId: req.query.spotId
            }).toArray(function(err, result) {
                if (err) throw err;

                if (result.length > 1) {
                    throw 'Overlapping spots error';
                }

                // send JSON response
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result[0]));
            });
        }
        catch (err) {
            console.log('Error fetching spot {} from db: {}'.format(req.query.spotId, err));
            res.end();
        }
    });
}