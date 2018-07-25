// configure all requirejs modules (TODO --> SETUP REQUIREJS OPTIMIZER)
(function() {
    var customModuleUrl = '../main/modules/'

    require.config({
        baseUrl: './../lib',
        paths: {
    
            // configure library modules
            'backbone': 'backbone-min',
            'jquery': 'jquery-min',
            'react': 'react-min',
            'underscore': 'underscore-min',

            // configure custom modules
            'format': customModuleUrl + 'format'
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
            'react': {
                exports: 'React'
            },
            'underscore': {
                exports: '_'
            },

            // shim custom modules
            'format': {
                deps: ['string-format-min'],
                exports: 'format'
            }
        }
    });
})();