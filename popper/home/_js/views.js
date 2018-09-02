define([
    'backbone',
    'jquery-wrapper',
    'underscore',
    'spot-clusterer',
    'format',
    'home-models'
], function(Backbone, $, _, __spotClusterer, __format, homeModels) {
    var app = {};

    app.HomeView = Backbone.View.extend({
        el: $('#home'),
        
        initialize: function(options) {

            // set map object on view
            this.mapObj = options.mapObject;

            // init map view
            this.mapView = new app.MapView({
                mapObject: this.mapObj
            });
        }
    });

    // map view
    app.MapView = Backbone.View.extend({
        el: $('#map'),

        // prepare map data
        initialize: function(options) {
            var self = this;

            // set map object on view
            this.mapObj = options.mapObject;

            // init info window view
            this.infoWindowView = null;

            // center view on current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }

                    self.mapObj.panTo(pos);
                });
            }

            // add spot on map click event
            this.mapObj.addListener('click', function(e) {

                // close info window if not null
                if (self.infoWindowView) {
                    self.infoWindowView.closeInfoWindow();
                    self.infoWindowView = null;
                }

                // add spot 
                else {
                    if (self.mapObj.getZoom() >= 14) {
                        self.addSpot(e.latLng);
                    }
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
                    }, spot.position, true);

                    preloadedSpots.push(preloadedSpot);
                }

                // set spot clustering strategy
                self.spotClusterer = new MarkerClusterer(self.mapObj, preloadedSpots, {
                    imagePath: './../../assets/images/cluster-',
                    maxZoom: 14
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
            }, pos, false)
        },

        // place spot on map
        placeSpot: function(spotData, position, initialLoad) {
            var self = this;

            // add spot to map
            var spot = new google.maps.Marker({
                position: position,
                map: this.mapObj,
                animation: initialLoad ? null : google.maps.Animation.DROP,
                icon: {
                    url: './../../assets/images/marker.png',
                    scaledSize: new google.maps.Size(35, 35),
                    anchor: new google.maps.Point(17, 35)
                }
            });

            // set spot data
            spot.set('data', spotData);

            // add event listener for spot click
            google.maps.event.addListener(spot, 'click', function() {

                // move to spot
                self.mapObj.panTo(spot.data.position);

                if (self.mapObj.getZoom() != 15) {
                    self.mapObj.setZoom(15);
                }

                // close info window if not null
                if (self.infoWindowView) {
                    self.infoWindowView.closeInfoWindow();
                }

                // create info window
                self.infoWindowView = new app.InfoWindowView({
                    mapObject: self.mapObj,
                    spotObject: spot
                });
            });

            // carry out operations if not initial load
            if (!initialLoad) {
                this.spotClusterer.addMarker(spot, true);
                google.maps.event.trigger(spot, 'click');
            }

            return spot;
        }
    });

    // info window wrapper view
    app.InfoWindowView = Backbone.View.extend({
        initialize: function(options) {

            // set map object on view
            this.mapObj = options.mapObject;

            // set spot object on view
            this.spotObj = options.spotObject;

            // init info window object
            this.infoWindow = null;

            this.createInfoWindow();
        },

        // create info window
        createInfoWindow: function() {   

            // format content string
            var contentString = '' +
                '<div id="content">'+
                    '<div id="siteNotice">'+
                    '</div>'+
                    '<h1 id="firstHeading" class="firstHeading">Info</h1>'+
                    '<div id="bodyContent">'+
                    '<p>{}</p>'.format(this.spotObj.data.spotId) +
                    '</div>'+
                '</div>';

            // buid info window
            this.infoWindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 75
            });

            // open info window
            this.infoWindow.open(this.mapObj, this.spotObj);
        },

        // close info window
        closeInfoWindow: function() {
            if (this.infoWindow) {
                this.infoWindow.close();
            }
        }
    });

    return app;
});