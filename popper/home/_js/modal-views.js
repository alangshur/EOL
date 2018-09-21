define([
    'backbone',
    'jquery-wrapper',
    'underscore',
    'format'
], function(Backbone, $, _, __format) {
    var app = {};

    app.AddCommentModalView = Backbone.View.extend({
        el: $('#modal-anchor'),

        // prepare comment modal data
        initialize: function(options) {
            this.isReply = options.isReply;

            // set reply info if appropriate
            if (this.isReply) {
                this.replyTargetUsername = options.replyTargetUsername;
                this.replyTargetId = options.replyTargetId;
            }

            // set map view on view 
            this.mapView = options.mapView;

            // set spot window object on view
            this.spotWindowView = options.spotWindowView;

            // set spot data on view
            this.spotData = options.spotData;

            // open commment modal
            this.openCommentModal();
        },

        // render comment modal
        render: function() {
            var template = _.template($('#add-comment-modal-template').html());

            this.$el.html(template());
        },

        // open comment modal
        openCommentModal: function() {
            var self = this;

            // close spot window
            this.spotWindowView.closeSpotWindow();
            
            // wait for window to close
            setTimeout(function() {

                // blur map and map canvas
                $('#map').addClass('blur');
                $('#map-canvas').addClass('blur');

                // hide map canvas
                $('#map-canvas').hide();

                // show overlay
                $('#overlay').show();

                // render modal
                self.render();

                // set header text
                if (self.isReply) {
                    $('.modal-header-text').text('Reply to {}'.format(self.replyTargetUsername));
                    $('#comment-text').val('@{}'.format(self.replyTargetUsername));
                }
                else {
                    $('.modal-header-text').text('Comment on {}\'s Spot'.format(self.spotData.author));
                }

                // set close button event
                $('.modal-exit-icon').on('click', function() {
                    self.closeCommentModal();
                });

                // set post button event
                $('.post-button').on('click', function() {

                    // return if the form is empty
                    if ($('#comment-text').val() == '') {
                        return;
                    }
                    
                    // post comment or reply
                    if (self.isReply) {
                        $.ajax({
                            type: 'POST',
                            url: '/spot/comment',
                            data: {
                                postType: 'comment',
                                spotData: JSON.stringify(self.spotData),
                                isReply: true,
                                replyTargetId: self.replyTargetId,
                                comment: $('#comment-text').val()
                            },
                            dataType: 'json'
                        }).done(function() {
    
                            // close comment modal
                            self.closeCommentModal();
                        });
                    }
                    else {
                        $.ajax({
                            type: 'POST',
                            url: '/spot/comment',
                            data: {
                                postType: 'comment',
                                spotData: JSON.stringify(self.spotData),
                                isReply: false,
                                comment: $('#comment-text').val()
                            },
                            dataType: 'json'
                        }).done(function() {

                            // close comment modal
                            self.closeCommentModal();
                        });
                    }
                });
            }, 1000);
        },

        // close comment modal
        closeCommentModal: function() {

            // remove modal html
            this.$el.html('');

            // de-blur map and map canvas
            $('#map').removeClass('blur');
            $('#map-canvas').removeClass('blur');

            // hide map canvas
            $('#map-canvas').show();

            // show overlay
            $('#overlay').hide();
            this.mapView.modalView = null;

            // open spot window
            this.spotWindowView.openSpotWindow();
        }
    });

    app.AddSpotModalView = Backbone.View.extend({
        el: $('#modal-anchor'),

        // prepare comment modal data
        initialize: function(options) {

            // check if add or edit
            this.isEdit = options.isEdit;

            // set map view on view 
            this.mapView = options.mapView;

            // set spot window object on view
            this.spotWindowView = options.spotWindowView;

            // set spot data on view
            this.spotData = options.spotData;

            // open commment modal
            this.openSpotModal();
        },

        // render comment modal
        render: function() {
            var template = _.template($('#add-spot-modal-template').html());

            this.$el.html(template());
        },

        // open comment modal
        openSpotModal: function() {
            var self = this;

            // close spot window if spot edit
            if (this.isEdit) {
                this.spotWindowView.closeSpotWindow();
            }
            
            // wait for window to close
            setTimeout(function() {

                // blur map and map canvas
                $('#map').addClass('blur');
                $('#map-canvas').addClass('blur');

                // hide map canvas
                $('#map-canvas').hide();

                // show overlay
                $('#overlay').show();

                // render modal
                self.render();

                // set header text
                if (self.isEdit) {
                    $('.modal-header-text').text('Edit Spot \"{}\"'.format(self.spotData.title));
                }
                else {
                    $('.modal-header-text').text('Create New Spot');
                }

                // fill in forms for edit
                if (self.isEdit) {
                    $('#modal-title-input').val(self.spotData.title);
                    $('#modal-type-input').val(self.spotData.type);
                    $('#modal-description-input').val(self.spotData.description);
                }

                // set close button event
                $('.modal-exit-icon').on('click', function() {
                    if (self.isEdit) {
                        self.closeSpotModal(false);
                    }
                    else {
                        self.closeSpotModal(true);
                    }
                });

                // set post button event
                $('.post-button').on('click', function() {

                    // return if any of the forms are empty
                    if ($('#modal-title-input').val() == '' || $('#modal-type-input').val() == '' || 
                        $('#modal-description-input').val() == '') {
                        
                        return;
                    }
                    
                    // post new spot or edit
                    $.ajax({
                        type: 'POST',
                        url: '/spot',
                        data: {
                            postType: 'spot',
                            isEdit: self.isEdit,
                            spotData: self.spotData,
                            modifiedSpotData: {
                                title: $('#modal-title-input').val(),
                                type: $('#modal-type-input').val(),
                                description: $('#modal-description-input').val()
                            }
                        },
                        dataType: 'json',
                        success: function(res) {
                            if (!self.isEdit) {
                                self.spotData = {
                                    spotId: res.spotId,
                                    position: self.spotData.position
                                };
                            }
                        }
                    }).done(function() {
                        if (!self.isEdit) {

                            // add spot to map
                            var spotObj = new google.maps.Marker({
                                position: self.spotData.position,
                                map: self.mapView.mapObj,
                                animation: google.maps.Animation.DROP,
                                icon: {
                                    url: './../../assets/images/marker.png',
                                    scaledSize: new google.maps.Size(35, 35),
                                    anchor: new google.maps.Point(17, 35)
                                }
                            });

                            // set spot data
                            spotObj.set('data', self.spotData);
                    
                            // add spot event listener
                            self.mapView.configureSpotListener(spotObj);

                            // set spotobj on active spot window
                            self.spotWindowView.spotObj = spotObj;
                        }

                        // close spot modal
                        self.closeSpotModal();
                    });
                });
            }, 1000);
        },

        // close comment modal
        closeSpotModal: function(ignoreSpotWindow) {

            // remove modal html
            this.$el.html('');

            // de-blur map and map canvas
            $('#map').removeClass('blur');
            $('#map-canvas').removeClass('blur');

            // hide map canvas
            $('#map-canvas').show();

            // show overlay
            $('#overlay').hide();
            this.mapView.modalView = null;

            // open spot window
            if (ignoreSpotWindow) {
                this.mapView.spotWindowView = null;
            }
            else {
                this.spotWindowView.openSpotWindow();
            }
        }
    });

    return app
});