define([
    'backbone',
    'jquery',
    'underscore',
    'format'
], function(Backbone, $, _, format) {
    var app = {};

    // define main login view
    app.LoginPageView = Backbone.View.extend({
        el: '#login-container',

        // render view upon initialization
        initialize: function() {
            this.render();
        },

        // render LoginPageView template
        render: function() {
            this.template = _.template($('#login-template').html());
            this.$el.append(this.template);
        }
    });

    app.LoginView = Backbone.View.extend({
        el: '#login-button',

        // register click event on login button
        events: {
            'click': 'validateCredentials'
        },

        // login user with credentials
        validateCredentials: function() {
            var _username = $('#username').val();
            var _password = $('#password').val();

            $.get('/login/db', {
                username: _username,
                password: _password
            }, function(data, status) {
                if (status == 'success') {
                    console.log(data)
                }
            });

            console.log('Credentials: ' + _username + ', ' + _password);
        }
    });

    return app;
});