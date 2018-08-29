require([
    'loginviews',
], function(loginviews) {
    var app = {};

    // initialize main view
    app.pageView = new loginviews.PageView();

    return app;
});