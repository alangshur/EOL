// configure all requirejs modules
(function() {
    var customModuleUrl = '../main/modules/';

    // feature urls
    var loginUrl = '../login/_js/';
    var homeUrl = '../home/_js/'

    require.config({
        baseUrl: './../lib',
        paths: {
    
            // configure library modules
            'backbone': 'backbone-min',
            'jquery-main': 'jquery-min',
            'underscore': 'underscore-min',
            'spot-clusterer': 'marker-clusterer-min',

            // configure custom modules
            'format': customModuleUrl + 'format',
            'jquery-wrapper': customModuleUrl + 'jquery-plugins',

            // configure home modules
            'home-views': homeUrl + 'views',
            'home-modal-views': homeUrl + 'modal-views',
            'home-window-views': homeUrl + 'window-views',
            'home-models': homeUrl + 'models',

            // configure login modules
            'login-views': loginUrl + 'views'
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
            'spot-clusterer': {
                exports: 'spotClusterer'
            },

            // shim custom modules
            'jquery-wrapper': {
                deps: ['jquery-main'],
                exports: '$'
            }
        }
    });
})();