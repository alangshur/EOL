define([
    'backbone',
    'underscore',
    'format'
], function(Backbone, _, __format) {
    var app = {};

    // declare Spot model
    app.Spot = Backbone.Model.extend({
        spotId: null,
        position: null
    });

    // declare SpotCollection collection
    app.SpotCollection = Backbone.Collection.extend({
        model: app.Spot,
        contentType: 'application/json',
        url: '/spot'
    });
    
    return app;
});