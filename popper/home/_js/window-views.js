define([
    'backbone',
    'jquery-wrapper',
    'underscore',
    'format',
    'home-modal-views'
], function(Backbone, $, _, __format, homeModalViews) {
    var app = {};

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

            this.openInfoWindow();
        },

        // open info window
        openInfoWindow: function() {   
            var self = this;

            // fetch spot data
            $.ajax({
                type: 'GET',
                url: '/spot',
                data: {
                    spotId: this.spotObj.data.spotId
                },
                success: function(data) {

                    // grab full spot data
                    self.spotData = data;
                },
                dataType: 'json'
            }).done(function() {

                // format content string
                var contentString = '' +
                    '<div id="content">' +
                        '<h1 id="iw-header">Info</h1>' +
                        '<div id="iw-body">' +
                            '<p id="iw-title-field"><b>Title: </b>{}</p>'.format(self.spotData.title) +
                            '<p id="iw-description-field"><b>Description: </b>{}</p>'.format(self.spotData.description) +
                        '</div>' +
                        '<button id="iw-button" style="cursor:pointer">View Spot</button>' +
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
                            spotObject: self.spotObj,
                            overrideOpen: false,
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

            // set map view on view 
            this.mapView = options.mapView;

            // set map object on view
            this.mapObj = options.mapObject;

            // set spot object on view
            this.spotObj = options.spotObject;

            // open window if no override
            if (!options.overrideOpen) {
                this.openSpotWindow();
            }
        },

        // render spot window
        render: function(spotData) {
            var template = _.template($('#spot-window-template').html());

            this.$el.html(template({
                spot: spotData
            }));
        },

        // open spot window
        openSpotWindow: function() {
            var self = this;

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
                url: '/spot',
                data: {
                    spotId: this.spotObj.data.spotId
                },
                success: function(data) {
                    
                    // grab full spot data
                    self.spotData = data;
                },
                dataType: 'json'
            }).done(function() {

                // render window
                self.render(self.spotData);

                // check if user id matches spot
                if (self.mapView.homeView.userId == self.spotData.authorId) {

                    // set listener for edit button
                    $('#edit-spot').on('click', function() {
                        
                        // create spot modal view
                        self.mapView.modalView = new homeModalViews.AddSpotModalView({
                            mapView: self.mapView,
                            spotWindowView: self,
                            spotData: self.spotData,
                            isEdit: true
                        });
                    });
                }
                else {

                    // hide edit button
                    $('#edit-spot').hide();
                }

                // set listener for add comment button
                $('#add-comment').on('click', function() {

                    // create comment modal view
                    self.mapView.modalView = new homeModalViews.AddCommentModalView({
                        mapView: self.mapView,
                        spotWindowView: self,
                        spotData: self.spotData,
                        isReply: false
                    });
                });

                // set listener for reply comment button
                $('.reply-button').on('click', function() {

                    // create comment modal view
                    self.mapView.modalView = new homeModalViews.AddCommentModalView({
                        mapView: self.mapView,
                        spotWindowView: self,
                        spotData: self.spotData,
                        isReply: true,
                        replyTargetUsername: this.getAttribute('data-comment-username'),
                        replyTargetId: this.getAttribute('data-comment-id')
                    });
                });

                // get profile icon width percentage
                const profileIconWidthPercentage = 45 / window.innerWidth * 100;

                // modify search bar
                $('#search-wrapper').css('width', '30%');
                $('#search-wrapper').css('left', '{}%'.format(70 - ((profileIconWidthPercentage + 33) / 2)));

                // move spot window
                self.$el.css('left', 0);
            });
        },

        // close spot window
        closeSpotWindow: function() {
            var self = this;

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

            // wait for 1s transition to remove
            setTimeout(function() {
                self.$el.html('');
            }, 1000);
        }
    });

    app.ProfileWindowView = Backbone.View.extend({});

    return app;
});