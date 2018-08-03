// configure all requirejs modules
(function() {
    var customModuleUrl = '../main/modules/'

    // feature urls
    var loginUrl = '../login/_js/'

    require.config({
        baseUrl: './../lib',
        paths: {
    
            // configure library modules
            'backbone': 'backbone-min',
            'jquery': 'jquery-min',
            'underscore': 'underscore-min',

            // configure custom modules
            'format': customModuleUrl + 'format',

            // configure login modules
            'loginviews': loginUrl + 'views'
        },
        shim: {
    
            // shim library modules
            'backbone': {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            },
            'jquery': {
                exports: '$'
            },
            'underscore': {
                exports: '_'
            }
        }
    });
})();