define([
    'backbone',
    'jquery-wrapper',
    'underscore',
    'spot-clusterer',
    'format',
    'home-models'
], function(Backbone, $, _, __format) {
    var app = {};

    app.addCommentModalView = new Backbone.View.extend({
        el: $('#modal-anchor'),

        // prepare comment modal data
        initialize: function(options) {

            // init reply target username and id (null if not a reply)
            this.replyTargetUsername = options.replyTargetUsername;
            this.replyTargetId = options.replyTargetId;

            // set map view on view 
            this.mapView = options.mapView;

            // set spot object on view
            this.spotObj = options.spotObject;
        },

        // render comment modal
        render: function() {

        },

        // open comment modal
        openCommentModal: function() {

            // blur map and map canvas
            $('#map').addClass('blur');
            $('#map-canvas').addClass('blur');

        },

        // close comment modal
        closeCommentModal: function() {

            // de-blur map and map canvas
            $('#map').removeClass('blur');
            $('#map-canvas').removeClass('blur');

            // remove modal html
            this.$el.html('');
        }
    });

    app.addSpotModalView = new Backbone.View.extend({
        el: $('#modal-anchor'),

        // prepare comment modal data
        initialize: function(options) {

        },

        // render comment modal
        render: function() {

        },

        // open comment modal
        openSpotModal: function() {

            // blur map and map canvas
            $('#map').addClass('blur');
            $('#map-canvas').addClass('blur');

        },

        // close comment modal
        closeSpotModal: function() {

            // de-blur map and map canvas
            $('#map').removeClass('blur');
            $('#map-canvas').removeClass('blur');

            // remove modal html
            this.$el.html('');
        }
    });

    return app
});