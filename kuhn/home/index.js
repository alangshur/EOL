/* HOME INDEX */

// init npm modules
const path = require('path');
const uuid = require('uuid');
const datetime = require('date-and-time');
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

    // GET for populate: #/populate
    app.get('/populate', (req, res) => {
        console.log('GET Request @ /populate');

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

    // GET for spot: #/spot
    app.get('/spot', (req, res) => {
        console.log('GET Request @ /spot');

        // get spot data for specific spot
        try {
            kwargs['mongoUtil'].Spot().findOne({
                spotId: req.query.spotId
            }, function(err, result) {
                if (err) throw err;

                // send JSON response
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
            });
        }
        catch (err) {
            console.log('Error fetching spot {} from db: {}'.format(req.query.spotId, err));
            res.end();
        }
    });

    // POST for spot: #/spot
    app.post('/spot', (req, res) => {
        console.log('POST Request @ /spot');

        var modifiedData = {
            $set: {}
        };

        if (req.body.isEdit === 'true') {

            // add each changed field
            if (req.body.spotData.title != req.body.modifiedSpotData.title) {
                modifiedData.$set.title = req.body.modifiedSpotData.title;
            }
            
            if (req.body.spotData.type != req.body.modifiedSpotData.type) {
                modifiedData.$set.type = req.body.modifiedSpotData.type;
            }

            if (req.body.spotData.description != req.body.modifiedSpotData.description) {
                modifiedData.$set.description = req.body.modifiedSpotData.description;
            }

            if (!Object.keys(modifiedData.$set).length) {
                console.log('Error editing spot {}: field values not changed'.format(req.body.spotData.spotId));

                // send JSON response
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    spotId: req.body.spotData.spotId
                }));

                return;
            }

            // replace db spot data with modified data
            try {
                kwargs['mongoUtil'].Spot().updateOne({
                    spotId: req.body.spotData.spotId
                }, modifiedData, function(err) {
                    if (err) throw err;

                    // print success message
                    console.log('Successfully edited spot {}'.format(req.body.spotData.spotId));

                    // send JSON response
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        spotId: req.body.spotData.spotId
                    }));
                });
            }
            catch (err) {
                console.log('Error editing spot {}: {}'.format(req.body.spotData.spotId, err));
                res.end();
            }
        }
        else {

            // generate spot id
            var spotId = 'spot-{}'.format(uuid.v1());

            // prepare new spot package
            newSpotData = {
                spotId: spotId,
                position: req.body.spotData.position, 
                title: req.body.modifiedSpotData.title,
                author: req.user.username,
                authorId: req.user._id,
                type: req.body.modifiedSpotData.type,
                description: req.body.modifiedSpotData.description,
                comments: []
            }

            // insert spot data
            try {
                kwargs['mongoUtil'].Spot().insertOne(newSpotData, function(err) {
                    if (err) throw err;

                    // print success message
                    console.log('Successfully posted spot {}'.format(spotId));

                    // send JSON response
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        spotId: spotId
                    }));
                });
            }
            catch (err) {
                console.log('Error posting new spot {}: {}'.format(spotId, err));
                res.end();
            }
        }
    });

    app.post('/spot/comment', (req, res) => {
        console.log('POST Request @ /spot/comment');

        // parse body string JSON
        const spotData = JSON.parse(req.body.spotData);
        var commentsArr = spotData.comments;

        // generate comment id
        const commentId = 'comment-{}'.format(uuid.v1());

        // generate datetime
        const formattedDateTime =  datetime.format(new Date(), 'MMMM[ ]D[, ]Y[ at ]h[:]mm[ ]A');
        
        if (req.body.isReply === 'true') {

            // format comment package
            const commentPackage = {
                commentId: commentId,
                type: 'reply',
                text: req.body.comment,
                time: formattedDateTime,
                user: req.user.username,
                userId: req.user._id
            };

            (function () {
                for (let i in spotData.comments) {
                    if (spotData.comments[i].commentId == req.body.replyTargetId) {

                        // push package at location
                        (commentsArr[i].replies).push(commentPackage);
                        return;
                    }

                    for (let j in spotData.comments[i].replies) {
                        if (spotData.comments[i].replies[j].commentId == req.body.replyTargetId) {

                            // push package at location
                            (commentsArr[i].replies).push(commentPackage);
                            return;
                        }
                    }
                }
            })();
        }
        else {

            // inject comment package
            commentsArr.push({
                commentId: commentId,
                type: 'comment',
                text: req.body.comment,
                time: formattedDateTime,
                user: req.user.username,
                userId: req.user._id,
                replies: []
            });
        }

        // replace db spot data with modified data
        try {
            kwargs['mongoUtil'].Spot().updateOne({
                spotId: spotData.spotId
            }, {
                $set: {
                    comments: commentsArr,
                }
            }, function(err) {
                if (err) throw err;

                // print success message
                console.log('Successfully posted comment {} to spot {}'.format(commentId, spotData.spotId));
                
                // send JSON response
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    spotId: spotData.spotId
                }));
            });
        }
        catch (err) {
            console.log('Error posting {} to db: {}'.format(req.body.postType, err));
            res.end();
        }
    });
}

