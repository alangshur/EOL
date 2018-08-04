require([
    'backbone',
    'jquery',
    'underscore',
    'format',
    'loginviews'
], function(Backbone, $, _, format, loginviews) {
    var app = {}

    // initialize main view
    app.loginPageView = new loginviews.LoginPageView();

    // initialize login view
    app.loginView = new loginviews.LoginView();

    // manage form svg
    $('#username').on('focus', function() {
        $("#rect").removeClass('rect2').addClass('rect1')
    });

    $('#password').on('focus', function() {
        $("#rect").removeClass('rect1').addClass('rect2')
    });

    return app;
});