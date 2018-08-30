define([
    'backbone',
    'jquery-wrapper',
    'underscore',
    'format',
    'home-models'
], function(Backbone, $, _, __format, homeModels) {
    var app = {};

    app.MapView = Backbone.View.extend({
        el: $('#map'),

        // prepare map data
        initialize: function(options) {
            var self = this;

            // set map object on view
            this.mapObj = options.mapObject;

            // add spot on map click event
            this.mapObj.addListener('click', function(e) {
                self.addSpot(e.latLng);
            });

            // init marker collection on view
            this.spotCollection = new homeModels.SpotCollection();

            // populate map
            this.populateMap();
        },

        populateMap: function() {
            var self = this;
            
            // update collection with spots
            this.spotCollection.fetch({
                reset: true
            }).done(function() {

                // place spots
                for(let spot of self.spotCollection.toJSON()) {
                    self.placeSpot(spot.spotId, new google.maps.LatLng(spot.lat, spot.long), false);
                }
            });
        },

        // add spot to map and db
        addSpot: function(coordinateObj) {

            // generate unique id
            const id = $.fn.uid();

            // add spot to collection
            this.spotCollection.create({
                spotId: id,
                lat: coordinateObj.lat(),
                long: coordinateObj.lng()
            });

            // place spots
            this.placeSpot(id, coordinateObj, true)
        },

        // place spot on map
        placeSpot: function(spotId, coordinateObj, dropAnimation) {

            // choose animation
            var iconAnimation = dropAnimation ? google.maps.Animation.DROP : null;

            // customize marker icon
            var customIcon = {
                url: './../../assets/images/marker.png',
                scaledSize: new google.maps.Size(35, 35),
                anchor: new google.maps.Point(17, 35)
            };

            // add spot to map
            var spot = new google.maps.Marker({
                position: coordinateObj,
                map: this.mapObj,
                animation: iconAnimation,
                icon: customIcon
            });

            // set id on spot
            spot.set('spotId', spotId);
        }
    });

    return app;
});