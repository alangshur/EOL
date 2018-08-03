require([
    'backbone',
    'jquery',
    'underscore',
    'format',
    'loginviews'
], function(Backbone, $, _, format, loginviews) {
    var app = {}

    // build main loginview
    app.loginView = new loginviews.LoginView();

    $('#username').on('focus', function() {
        $("#rect").removeClass('rect2').addClass('rect1')
    });

    $('#password').on('focus', function() {
        $("#rect").removeClass('rect1').addClass('rect2')
    });

    return app;
});