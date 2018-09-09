var map;

function initMap() {

    // init map
    var map = new google.maps.Map(document.getElementById('map'), {

        // configure initial viewport
        center: {lat: 41.957280, lng: -87.666540},
        zoom: 16,

        // set cursor type
        draggableCursor: 'default',

        // configure max viewport zoom
        minZoom: 11,
        maxZoom: 19,
        
        // configure ui controls
        disableDefaultUI: true,

        // configure map styling
        styles: [  
            {  
               "stylers": [  
                    {  
                        "saturation": 40
                    },
                    {
                        "visibility": -5
                    },
                    {  
                        "visibility": "on"
                    },
                    {  
                        "weight": 1
                    }
               ]
            },
            {
               "featureType": "administrative",
               "elementType": "labels",
               "stylers": [  
                    {
                        "visibility": "off"
                    }
                ]
            },
            {  
               "featureType": "administrative.locality",
               "stylers": [  
                    {  
                        "visibility": "on"
                    }
               ]
            },
            {  
               "featureType": "landscape",
               "elementType": "labels",
               "stylers": [  
                    {  
                        "visibility": "off"
                    }
               ]
            },
            {  
               "featureType": "landscape.man_made",
               "stylers": [  
                    {  
                        "saturation": -100
                    },
                    {  
                        "lightness": 15
                    }
               ]
            },
            {  
               "featureType": "poi",
               "elementType": "labels",
               "stylers": [  
                    {  
                        "visibility": "off"
                    }
               ]
            },
            {  
               "featureType": "poi.attraction",
               "stylers": [  
                    {  
                        "saturation": -100
                    }
               ]
            },
            {  
               "featureType": "poi.government",
               "stylers": [  
                    {  
                        "saturation": -100
                    }
               ]
            },
            {  
               "featureType": "poi.medical",
               "stylers": [  
                    {  
                        "saturation": -100
                    }
               ]
            },
            {  
               "featureType": "poi.place_of_worship",
               "stylers": [  
                    {  
                        "saturation": -100
                    }
               ]
            },
            {  
               "featureType": "poi.school",
               "elementType": "geometry",
               "stylers": [  
                    {  
                        "saturation": -100
                    }
               ]
            },
            {  
               "featureType": "road",
               "elementType": "geometry",
               "stylers": [  
                    {  
                        "visibility": "on"
                    }
               ]
            },
            {  
               "featureType": "road",
               "elementType": "labels",
               "stylers": [  
                    {  
                        "visibility":"on"
                    }
               ]
            },
            {  
               "featureType": "road.arterial",
               "stylers": [  
                    {  
                        "visibility": "on"
                    }
               ]
            },
            {  
               "featureType": "road.highway",
               "stylers": [  
                    {  
                        "visibility": "on"
                    }
               ]
            },
            {  
               "featureType": "road.highway.controlled_access",
               "stylers": [  
                    {  
                        "visibility": "on"
                    }
               ]
            },
            {  
               "featureType": "road.local",
               "stylers": [  
                    {  
                        "visibility": "on"
                    }
               ]
            },
            {  
               "featureType": "transit",
               "elementType": "labels",
               "stylers": [  
                    {  
                        "visibility": "off"
                    }
               ]
            },
            {  
               "featureType": "water",
               "stylers": [  
                    {  
                        "saturation": 100
                    },
                    {  
                        "lightness": -15
                    }
               ]
            },
            {  
               "featureType": "water",
               "elementType": "labels",
               "stylers": [  
                    {  
                        "lightness": "12"
                    },
                    {  
                        "visibility": "off"
                    }
               ]
            }
        ]
    });

    // load js after map
    require([
        'home-views'
    ], function(homeViews) {
        var app = {};

        // init map view
        app.homeView = new homeViews.HomeView({
            mapObject: map
        });

        return app;
    });
}