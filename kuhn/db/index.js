// define middleware exports to main
module.exports = function(app) {

    // GET for test: #/test
    app.get('/test', (req, res) => {
        var response = {
            msg: "Functioning GET export system"
        };

        res.json(response);
    });
}

