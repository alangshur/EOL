define([
    'backbone',
    'jquery-wrapper',
    'underscore',
    'spot-clusterer',
    'format',
    'home-window-views',
    'home-modal-views',
    'home-models'
], function(Backbone, $, _, __spotClusterer, __format, homeWindowViews, homeModalViews, homeModels) {
    var app = {};

    // home view
    app.HomeView = Backbone.View.extend({

        // prepare home data
        initialize: function(options) {
            var self = this;

            // set map object on view
            this.mapObj = options.mapObject;

            // init map view
            this.mapView = new app.MapView({
                mapObject: this.mapObj
            });

            // load jQuery plugins
            $.fn.loadEnterListener();
            $.fn.loadInputClickData();

            // add custom zoom functionality
            $('#zoom-in').on('click', function() {
                self.zoomMapIn();
            });
            $('#zoom-out').on('click', function() {
                self.zoomMapOut();
            });
            
            // setup add spot event
            $('#add-spot-icon').on('click', function() {
                if (self.mapView.addSpotMode) {
                    self.revertAddSpotMode();
                }
                else {
                    if (self.mapObj.getZoom() < 16) {
                        self.mapObj.setZoom(16);
                    }

                    self.mapObj.setOptions({
                        draggableCursor: 'copy',
                        minZoom: 16
                    });

                    self.mapView.addSpotMode = true;
                }
            });

            // setup profile event
            $('#profile-icon').on('click', function() {

                // revert add spot mode
                if (self.mapView.addSpotMode) {
                    self.revertAddSpotMode();
                }
            });

            // setup search bar 'click' event
            $('#search-bar').on('click', function() {
            
                // revert add spot mode
                if (self.mapView.addSpotMode) {
                    self.revertAddSpotMode();
                }
            });

            // setup search bar 'enter' event
            $('#search-bar').on('enter', function() {
                var searchPhrase = $('#search-bar').val();

                // reset input field
                $('#search-bar').val('');

                // search with searchPhrase
                self.search(searchPhrase);
            });
        },

        // zoom map in
        zoomMapIn: function() {
            this.mapObj.setZoom(this.mapObj.getZoom() + 1);
        },

        // zoom map out
        zoomMapOut: function() {
            this.mapObj.setZoom(this.mapObj.getZoom() - 1);
        },

        // revert add spot mode
        revertAddSpotMode: function() {
            this.mapObj.setOptions({
                draggableCursor: 'default',
                minZoom: 11
            });

            this.mapView.addSpotMode = false;
        },

        // search spots
        search: function(searchPhrase) {
            console.log('Searched: {}'.format(searchPhrase));

            // close info window if not null
            if (this.mapView.infoWindowView) {
                this.mapView.infoWindowView.closeInfoWindow();
                this.mapView.infoWindowView = null;
            }

            // close spot window if not null
            if (this.mapView.spotWindowView) {
                this.mapView.spotWindowView.closeSpotWindow();
                this.mapView.spotWindowView = null;
            }
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

            // init spot window object
            this.spotWindowView = null;

            // init modal view
            this.modalView = null;

            // init add spot mode
            this.addSpotMode = false;

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
                }

                // close spot window if not null
                if (self.spotWindowView) {
                    self.spotWindowView.closeSpotWindow();
                }

                // reset both windows and return
                if (self.infoWindowView || self.spotWindowView) {
                    self.infoWindowView = null;
                    self.spotWindowView = null;

                    return;
                }

                // return if add spot mode is false
                if (self.addSpotMode) {

                    // revert add spot mode
                    self.mapObj.setOptions({
                        draggableCursor: 'default',
                        minZoom: 11
                    });

                    self.addSpotMode = false;

                    // add spot 
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
                    maxZoom: 15
                });
            });
        },

        // add spot to map and db
        addSpot: function(position) {
            var self = this;
            
            // format position
            var pos = {
                lat: position.lat(),
                lng: position.lng()
            }

            // add spot to collection
            this.spotCollection.create({
                position: pos
            }, {
                success: function(model, response) {

                    // set id on model
                    model.set({
                        spotId: response.spotId
                    });

                    // place spot
                    self.placeSpot({
                        spotId: response.spotId,
                        position: response.position
                    }, response.position, false);
                }
            });
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

                if (self.mapObj.getZoom() != 18) {
                    self.mapObj.setZoom(18);
                }

                // close info window if not null
                if (self.infoWindowView) {
                    self.infoWindowView.closeInfoWindow();
                    self.infoWindowView = null;
                }

                // close spot window if not null
                if (self.spotWindowView) {
                    self.spotWindowView.closeSpotWindow();
                    self.spotWindowView = null;
                }

                // revert add spot mode if true
                if (self.addSpotMode) {
                    self.mapObj.setOptions({
                        draggableCursor: 'default',
                        minZoom: 11
                    });

                    self.addSpotMode = false;
                }

                // create info window
                self.infoWindowView = new homeWindowViews.InfoWindowView({
                    mapView: self,
                    mapObject: self.mapObj,
                    spotObject: spot
                });
            });

            // carry out operations if not initial load
            if (!initialLoad) {
                this.spotClusterer.addMarker(spot, true);

                // move to spot
                this.mapObj.panTo(spot.data.position);

                if (this.mapObj.getZoom() != 18) {
                    this.mapObj.setZoom(18);
                }
                
                // create spot window (TODO: make modal for spot editing)
                this.spotWindowView = new homeWindowViews.SpotWindowView({
                    mapView: self,
                    mapObject: self.mapObj,
                    spotObject: spot
                });
            }

            return spot;
        }
    });

    return app;
});