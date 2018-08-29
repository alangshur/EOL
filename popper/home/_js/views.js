define([
    'backbone',
    'jquery-wrapper',
    'underscore',
    'format'
], function(Backbone, $, _, __format) {
    var app = {};

    app.MapView = Backbone.View.extend({
        initialize: function(options) {

            // set map object on view
            this.mapObject = options.mapObject;
        }
    });

    return app;
});