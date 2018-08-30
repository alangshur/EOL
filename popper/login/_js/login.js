require([
    'login-views',
], function(loginViews) {
    var app = {};

    // initialize main view
    app.pageView = new loginViews.PageView();

    return app;
});