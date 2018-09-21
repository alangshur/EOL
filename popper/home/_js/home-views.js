define([
    'backbone',
    'jquery-wrapper',
    'underscore',
    'spot-clusterer',
    'format',
    'home-window-views',
    'home-modal-views',
], function(Backbone, $, _, __spotClusterer, __format, homeWindowViews, homeModalViews) {
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

                // ignore if modal is open
                if (self.mapView.modalView) {
                    return;
                }

                self.zoomMapIn();
            });
            $('#zoom-out').on('click', function() {

                // ignore if modal is open
                if (self.mapView.modalView) {
                    return;
                }

                self.zoomMapOut();
            });
            
            // setup add spot event
            $('#add-spot-icon').on('click', function() {

                // ignore if modal is open
                if (self.mapView.modalView) {
                    return;
                }

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

                // ignore if modal is open
                if (self.mapView.modalView) {
                    return;
                }

                // revert add spot mode
                if (self.mapView.addSpotMode) {
                    self.revertAddSpotMode();
                }
            });

            // setup search bar 'click' event
            $('#search-bar').on('click', function() {

                // ignore if modal is open
                if (self.mapView.modalView) {
                    return;
                }
            
                // revert add spot mode
                if (self.mapView.addSpotMode) {
                    self.revertAddSpotMode();
                }
            });

            // setup search bar 'enter' event
            $('#search-bar').on('enter', function() {

                // ignore if modal is open
                if (self.mapView.modalView) {
                    return;
                }

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

                // ignore if modal is open
                if (self.modalView) {
                    return;
                }

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

            // populate map
            this.populateMap();
        },

        populateMap: function() {
            var self = this;
            var preloadedSpots = [];

            // update collection with spots
            $.ajax({
                type: 'GET',
                url: '/populate',
                dataType: 'json',
                success: function(res) {
                    self.spotArr = res;
                }
            }).done(function() {

                // initialize every spot
                for(let spot of self.spotArr) {

                    // correct spot position
                    var correctedPosition =  {
                        lat: Number(spot.position.lat),
                        lng: Number(spot.position.lng)
                    };

                    // add spot to map
                    var spotObj = new google.maps.Marker({
                        position: correctedPosition,
                        map: self.mapObj,
                        animation: null,
                        icon: {
                            url: './../../assets/images/marker.png',
                            scaledSize: new google.maps.Size(35, 35),
                            anchor: new google.maps.Point(17, 35)
                        }
                    });

                    preloadedSpots.push(spotObj);

                    // set spot data
                    spotObj.set('data', {
                        spotId: spot.spotId,
                        position: correctedPosition
                    });

                    // add spot event listener
                    self.configureSpotListener(spotObj);
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

            // format position
            var formattedPosition = {
                lat: position.lat(),
                lng: position.lng()
            }

            // move to spot
            this.mapObj.panTo(formattedPosition);

            if (this.mapObj.getZoom() != 18) {
                this.mapObj.setZoom(18);
            }

            // close all windows
            this.closeAllWindows();

            // set new spot window with open override
            this.spotWindowView = new homeWindowViews.SpotWindowView({
                mapView: this,
                mapObject: this.mapObj,
                spotObject: null,
                overrideOpen: true
            });

            // create spot modal
            this.modalView = new homeModalViews.AddSpotModalView({
                mapView: this,
                spotWindowView: this.spotWindowView,
                spotData: {
                    position: formattedPosition
                },
                isEdit: false
            });
        },

        // place spot on map
        configureSpotListener: function(spotObj) {
            var self = this;
            
            google.maps.event.addListener(spotObj, 'click', function() {

                // ignore if modal is open
                if (self.modalView) {
                    return;
                }

                // close all windows
                self.closeAllWindows();

                // move to spot
                self.mapObj.panTo(spotObj.data.position);

                if (self.mapObj.getZoom() != 18) {
                    self.mapObj.setZoom(18);
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
                    spotObject: spotObj
                });
            });
        },

        // force close all windows
        closeAllWindows: function() {

            // close info window if not null
            if (this.infoWindowView) {
                this.infoWindowView.closeInfoWindow();
            }

            // close spot window if not null
            if (this.spotWindowView) {
                this.spotWindowView.closeSpotWindow();
            }

            this.infoWindowView = null;
            this.spotWindowView = null;
        }
    });

    return app;
});