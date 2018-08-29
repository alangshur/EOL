var map;

function initMap() {

    // initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.957280, lng: -87.666540},
        zoom: 15
    });

    // load js after map
    require([
        'homeviews',
    ], function(homeviews) {
        var app = {};
    
        // initialize map view
        app.mapView = new homeviews.MapView({
            mapObject: map
        });
    
        return app;
    });
}