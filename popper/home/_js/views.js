define([
    'backbone',
    'jquery-wrapper',
    'underscore',
    'spot-clusterer',
    'format',
    'home-models'
], function(Backbone, $, _, __spotClusterer, __format, homeModels) {
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

                // revert add spot mode
                if (self.mapView.addSpotMode) {
                    self.revertAddSpotMode();
                }

                self.zoomMapIn();
            });
            $('#zoom-out').on('click', function() {

                // revert add spot mode
                if (self.mapView.addSpotMode) {
                    self.revertAddSpotMode();
                }

                self.zoomMapOut();
            });
            
            // setup add spot event
            $('#add-spot-icon').on('click', function() {
                if (self.mapView.addSpotMode) {
                    self.revertAddSpotMode();
                }
                else {
                    self.mapObj.setOptions({
                        draggableCursor: 'copy'
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
                draggableCursor: 'default'
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
                        draggableCursor: 'default'
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
                        draggableCursor: 'default'
                    });

                    self.addSpotMode = false;
                }

                // create info window
                self.infoWindowView = new app.InfoWindowView({
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
                
                // create spot window
                this.spotWindowView = new app.SpotWindowView({
                    mapView: self,
                    mapObject: self.mapObj,
                    spotObject: spot
                });
            }

            return spot;
        }
    });

    // info window wrapper view
    app.InfoWindowView = Backbone.View.extend({

        // prepare info window data
        initialize: function(options) {

            // set map view on view 
            this.mapView = options.mapView;

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
            var self = this;

            // fetch spot data
            $.ajax({
                type: 'POST',
                url: '/spot/info',
                data: {
                    spotId: this.spotObj.data.spotId
                },
                success: function(data) {
                    self.spotData = data;
                },
                dataType: 'json'
            }).done(function() {

                // format content string
                var contentString = '' +
                    '<div id="content">' +
                        '<h1 id="iw-header">Info</h1>' +
                        '<div id="iw-body">' +
                            '<p><b>Description:</b> {}</p>'.format(self.spotData.description) +
                        '</div>' +
                        '<button id="iw-button">View Spot</button>' +
                    '</div>';

                // buid info window
                self.infoWindow = new google.maps.InfoWindow({
                    content: contentString,
                    pixelOffset: new google.maps.Size(-1, -5),
                    maxWidth: 210
                });

                // add button functionality on 'domready' event
                google.maps.event.addListenerOnce(self.infoWindow, 'domready', function() {
                    $('#iw-button').on('click', function() {

                        // close info window
                        self.closeInfoWindow();
                        self.mapView.infoWindowView = null;

                        // open spot window
                        self.mapView.spotWindowView = new app.SpotWindowView({
                            mapView: self.mapView,
                            mapObject: self.mapObj,
                            spotObject: self.spotObj
                        });
                    });
                });

                // open info window
                self.infoWindow.open(self.mapObj, self.spotObj);
            });
        },

        // close info window
        closeInfoWindow: function() {
            if (this.infoWindow) {
                this.infoWindow.close();
            }
        }
    });

    // spot window view
    app.SpotWindowView = Backbone.View.extend({
        el: $('spot-window'),

        // prepare spot window data
        initialize: function(options) {
            var self = this;

            // set map view on view 
            this.mapView = options.mapView;

            // set map object on view
            this.mapObj = options.mapObject;

            // set spot object on view
            this.spotObj = options.spotObject;

            // fetch spot data
            $.ajax({
                type: 'POST',
                url: '/spot/info',
                data: {
                    spotId: this.spotObj.data.spotId
                },
                success: function(data) {
                    self.spotData = data;
                },
                dataType: 'json'
            }).done(function() {

                // open window
                self.openSpotWindow();
            });
        },

        // open spot window
        openSpotWindow: function() {

            // modify search bar
            $('#search-bar').css('margin-left', 267);
            $('#search-bar').css('width', 300);

            // move spot window
            $('#spot-window').show();
            $('#spot-window').css('left', 0);
        },

        // close spot window
        closeSpotWindow: function() {

            // move search back to resting position
            $('#search-bar').css('margin-left', 0);
            $('#search-bar').css('width', 400);

            // move spot window back to resting position
            $('#spot-window').css('left', -348);

            // wait for 1s transition
            setTimeout(function() {
                $('#spot-window').hide();
            }, 1000);
        }
    });

    return app;
});