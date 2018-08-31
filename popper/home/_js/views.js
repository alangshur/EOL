define([
    'backbone',
    'jquery-wrapper',
    'underscore',
    'spot-clusterer',
    'format',
    'home-models'
], function(Backbone, $, _, __spotClusterer, __format, homeModels) {
    var app = {};

    app.MapView = Backbone.View.extend({
        el: $('#map'),

        // prepare map data
        initialize: function(options) {
            var self = this;

            // set map object on view
            this.mapObj = options.mapObject;

            // center view
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }

                    self.mapObj.setCenter(pos);
                });
            }

            // add spot on map click event
            this.mapObj.addListener('click', function(e) {
                if (self.mapObj.getZoom() >= 16) {
                    self.addSpot(e.latLng);
                }
            });

            // init marker collection on view
            this.spotCollection = new homeModels.SpotCollection();

            // populate map
            this.populateMap();
        },

        populateMap: function() {
            var self = this;
            var preloadedSpots = [];

            // update collection with spots
            this.spotCollection.fetch({
                reset: true
            }).done(function() {

                // place spots
                for(let spot of self.spotCollection.toJSON()) {
                    var preloadedSpot = self.placeSpot({
                        spotId: spot.spotId,
                        position: spot.position
                    }, spot.position, false);

                    preloadedSpots.push(preloadedSpot);
                }

                // set spot clustering strategy
                self.spotClusterer = new MarkerClusterer(self.mapObj, preloadedSpots, {
                    imagePath: './../../assets/images/cluster-',
                    maxZoom: 15
                });
            });
        },

        // add spot to map and db
        addSpot: function(position) {

            // generate unique id
            const id = $.fn.uid();

            // format position
            var pos = {
                lat: position.lat(),
                lng: position.lng()
            }

            // add spot to collection
            this.spotCollection.create({
                spotId: id,
                position: pos
            });

            // place spots
            this.placeSpot({
                spotId: id,
                position: pos
            }, pos, true)
        },

        // place spot on map
        placeSpot: function(spotData, position, dropAnimation) {
            var self = this;

            // add spot to map
            var spot = new google.maps.Marker({
                position: position,
                map: this.mapObj,
                animation: dropAnimation ? google.maps.Animation.DROP : null,
                icon: {
                    url: './../../assets/images/marker.png',
                    scaledSize: new google.maps.Size(35, 35),
                    anchor: new google.maps.Point(17, 35)
                }
            });

            // set spot data
            spot.set('data', spotData);

            // add spot to clusterer automatically if not initial load
            if (dropAnimation) {
                this.spotClusterer.addMarker(spot, true);
            }

            // add event listener to spot
            google.maps.event.addListener(spot, 'click', function() {
                self.mapObj.panTo(spot.data.position);
                self.mapObj.setZoom(15);

                // open info window on spot
            });

            return spot;
        }
    });

    app.InfoWindowView = Backbone.View.extend({

    });

    return app;
});