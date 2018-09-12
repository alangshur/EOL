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
                
                // create spot window (TODO: make modal for spot editing)
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
                type: 'GET',
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
        el: $('#spot-window'),

        // prepare spot window data
        initialize: function(options) {
            var self = this;

            // set map view on view 
            this.mapView = options.mapView;

            // set map object on view
            this.mapObj = options.mapObject;

            // set spot object on view
            this.spotObj = options.spotObject;

            // move to spot with window offset
            this.mapObj.panTo(this.spotObj.data.position);
            this.mapObj.panBy(this.mapObj.getDiv().offsetWidth * -0.2, 0);

            if (this.mapObj.getZoom() != 18) {
                this.mapObj.setZoom(18);
            }

            // convert marker style
            this.spotObj.setIcon({
                url: './../../assets/images/marker-selected.png',
                scaledSize: new google.maps.Size(35, 35),
                anchor: new google.maps.Point(17, 35)
            });

            // fetch spot data
            $.ajax({
                type: 'GET',
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

        // render spot window
        render: function(spotInfo) {
            var template = _.template($('#spot-window-template').html());

            this.$el.html(template({
                spot: {
                    title: 'My Home',
                    author: 'AlexLangshur',
                    type: 'Residence',
                    description: 'I love my home',
                    comments: [
                        {
                            text: 'I agree! I really like your home, Alex!',
                            user: 'SebastienNacher',
                            time: 'September 11, 2018 at 5:33 PM',
                            replies: [
                                {
                                    text: 'Couldn\'t have said it better myself!',
                                    user: 'RyanKearns',
                                    time: 'September 12, 2018 at 2:06 PM'
                                },
                                {
                                    text: 'Good talk fam!',
                                    user: 'AlexLangshur',
                                    time: 'September 12, 2018 at 2:07 PM'
                                }
                            ]
                        },
                        {
                            text: 'Lovely home! Great place to be!',
                            user: 'OttoMarloft',
                            time: 'September 11, 2018 at 5:41 PM',
                            replies: [
                                {
                                    text: 'Yas Queen!!',
                                    user: 'MaxComolli',
                                    time: 'September 14, 2018 at 2:14 PM'
                                }
                            ]
                        },
                        {
                            text: 'I agree! I really like your home, Alex!',
                            user: 'SebastienNacher',
                            time: 'September 11, 2018 at 5:33 PM',
                            replies: [
                                {
                                    text: 'Couldn\'t have said it better myself!',
                                    user: 'RyanKearns',
                                    time: 'September 12, 2018 at 2:06 PM'
                                },
                                {
                                    text: 'Good talk fam!',
                                    user: 'AlexLangshur',
                                    time: 'September 12, 2018 at 2:07 PM'
                                }
                            ]
                        }
                    ]
                }
            }));
        },

        // open spot window
        openSpotWindow: function() {

            // render window
            this.render(this.spotData);

            // get profile icon width percentage
            const profileIconWidthPercentage = 45 / window.innerWidth * 100;

            // modify search bar
            $('#search-wrapper').css('width', '30%');
            $('#search-wrapper').css('left', '{}%'.format(70 - ((profileIconWidthPercentage + 33) / 2)));

            // move spot window
            this.$el.show();
            this.$el.css('left', 0);
        },

        // close spot window
        closeSpotWindow: function() {

            // revert icon style
            this.spotObj.setIcon({
                url: './../../assets/images/marker.png',
                scaledSize: new google.maps.Size(35, 35),
                anchor: new google.maps.Point(17, 35)
            });

            // move search back to resting position
            $('#search-wrapper').css('width', '35%');
            $('#search-wrapper').css('left', '{}%'.format(50 - (35 / 2)));

            // move spot window back to resting position
            this.$el.css('left', '-41%');

            // wait for 1s transition
            setTimeout(function() {
                $('#spot-window').hide();
            }, 1000);
        }
    });

    return app;
});