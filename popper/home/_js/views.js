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
            
            // add zoom functionality
            $('#zoom-in').on('click', function() {
                self.zoomMapIn();
            });
            $('#zoom-out').on('click', function() {
                self.zoomMapOut();
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

        // search spots
        search: function() {

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

                // close spot window if not null
                else if (self.spotWindowView) {
                    self.spotWindowView.closeSpotWindow();
                    self.spotWindowView = null;
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
                    self.infoWindowView = null;
                }

                // close spot window if not null
                if (self.spotWindowView) {
                    self.spotWindowView.closeSpotWindow();
                    self.spotWindowView = null;
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
                
                // create spot window
                self.spotWindowView = new app.SpotWindowView({
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
                    '<div id="content">'+
                        '<div id="siteNotice">'+
                        '</div>'+
                        '<h1 id="firstHeading" class="firstHeading">Info</h1>'+
                        '<div id="bodyContent">'+
                        '<p><b>Description:</b> {}</p>'.format(self.spotData.description) +
                        '</div>'+
                    '</div>';

                // buid info window
                self.infoWindow = new google.maps.InfoWindow({
                    content: contentString,
                    maxWidth: 275
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
            $('#spot-window').hide();
            $('#spot-window').css('left', -345);
        }
    });

    return app;
});