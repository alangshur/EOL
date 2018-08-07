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
            'jquery-main': 'jquery-min',
            'underscore': 'underscore-min',

            // configure custom modules
            'format': customModuleUrl + 'format',
            'jquery-wrapper': customModuleUrl + 'jquery-plugins',

            // configure login modules
            'loginviews': loginUrl + 'views'
        },
        shim: {

            // shim library modules
            'backbone': {
                deps: ['underscore', 'jquery-wrapper'],
                exports: 'Backbone'
            },
            'jquery-main': {
                exports: '$'
            },
            'underscore': {
                exports: '_'
            },

            // shim custom modules
            'jquery-wrapper': {
                deps: ['jquery-main'],
                exports: '$'
            }
        }
    });
})();