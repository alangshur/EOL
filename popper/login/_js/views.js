define([
    'backbone',
    'jquery-wrapper',
    'underscore',
    'format'
], function(Backbone, $, _, __format) {
    var app = {};
    
    // define main login view
    app.PageView = Backbone.View.extend({
        el: '#view-container',

        // register click and focus events
        events: {
            'click #back-button': 'loadLoginTemplate',
            'click #register-view-button': 'loadRegisterTemplate',
            'focus #login-username': 'loadLoginRectUsername',
            'focus #login-password': 'loadLoginRectPassword',
            'focus #register-username': 'loadRegisterRectUsername',
            'focus #register-password': 'loadRegisterRectPassword',
            'focus #email': 'loadRegisterRectEmail',
            'enter #login-password': 'loginWithEnter',
            'enter #register-password': 'registerWithEnter'
        },

        // render view upon initialization
        initialize: function() {
            $('#loading-gif').hide();

            // handle loading icon
            $(document).ajaxStart(function() {
                $('#login-block').addClass('blur');

                setTimeout(function() {
                    $('#loading-gif').show();
                }, 100);
            });

            $(document).ajaxStop(function() {
                $('#loading-gif').hide();
                $('#login-block').removeClass('blur');
            });

            this.loadLoginTemplate();            
        },

        // render LoginPageView template
        render: function() {
            this.$el.html(this.template);
        },

        // load login template
        loadLoginTemplate: function() {
            this.template = _.template($('#login-template').html());
            this.render();

            // initialize jQuery object for SVG container
            this.$svgContainer = $('#svg-container');

            // initialize jQuery object for SVG rect
            this.$rectOne = $('#rect-1');

            // re-initialize attached register view
            this.loginView = new app.LoginView();

            // reload jquery "enter event" plugin listener for new template
            $.fn.loadEnterListener();
        },

        // load register template
        loadRegisterTemplate: function() {
            this.template = _.template($('#register-template').html());
            this.render();

            // initialize jQuery object for SVG container
            this.$svgContainer = $('#svg-container');

            // initialize jQuery objects for different SVG rects
            this.$rectTwo = $('#rect-2');
            this.$rectThree = $('#rect-3');
            this.$rectFour = $('#rect-4');

            // setup initial rect configuration
            this.$rectThree.hide();
            this.$rectFour.hide();

            this.lastForm = 'email';

            // re-initialize attached register view
            this.registerView = new app.RegisterView();

            // reload jquery "enter event" plugin listener for new template
            $.fn.loadEnterListener();
        },

        // configure rect SVG transformations
        loadLoginRectUsername: function() {
            this.$rectOne.removeClass().addClass('rect-config-1');
        },
        loadLoginRectPassword: function() {
            this.$rectOne.removeClass().addClass('rect-config-2');
        },
        loadRegisterRectUsername: function() {
            if (this.lastForm == 'email') {
                this.$rectThree.hide();
                this.$rectFour.hide();
                this.$rectTwo.show();

                this.$rectTwo.removeClass().addClass('rect-config-2');
            }
            else if (this.lastForm == 'password') {
                this.$rectTwo.hide();
                this.$rectFour.hide();
                this.$rectThree.show();

                this.$rectThree.removeClass().addClass('rect-config-1');
            }

            this.lastForm = 'username';
        },
        loadRegisterRectPassword: function() {
            if (this.lastForm == 'username') {
                this.$rectTwo.hide();
                this.$rectThree.show();

                this.$rectThree.removeClass().addClass('rect-config-2');
                this.$rectFour.removeClass().addClass('rect-config-4');
            }
            else if (this.lastForm == 'email') {
                this.$rectTwo.hide();
                this.$rectThree.hide();
                this.$rectFour.show();

                this.$rectTwo.removeClass().addClass('rect-config-2');
                this.$rectThree.removeClass().addClass('rect-config-2');
                this.$rectFour.removeClass().addClass('rect-config-4');
            }

            this.lastForm = 'password';
        },
        loadRegisterRectEmail: function()  {
            if (this.lastForm == 'username') {
                this.$rectThree.hide();
                this.$rectTwo.show();

                this.$rectTwo.removeClass().addClass('rect-config-1');
                this.$rectFour.removeClass().addClass('rect-config-3');
            }
            else if (this.lastForm == 'password') {
                this.$rectTwo.hide();
                this.$rectThree.hide();
                this.$rectFour.show();

                this.$rectTwo.removeClass().addClass('rect-config-1');
                this.$rectThree.removeClass().addClass('rect-config-1');
                this.$rectFour.removeClass().addClass('rect-config-3');
            }
            
            this.lastForm = 'email';
        },

        // jquery "enter event" plugin callbacks
        loginWithEnter: function() {
            this.loginView.validateCredentials();
        },
        registerWithEnter: function() {
            this.registerView.validateCredentials();
        },
    });

    // define login button functionality
    app.LoginView = Backbone.View.extend({
        el: '#login-button',

        // register click and custom enter event on login button
        events: {
            'click': 'validateCredentials'
        },

        // login user with credentials
        validateCredentials: function() {
            var _username = $('#login-username').val();
            var _password = $('#login-password').val();

            var errorMessage = null;

            // ajax POST request
            $.ajax({
                type: 'POST',
                url: '/login/db',
                data: {
                    username: _username,
                    password: _password
                },
                success: function(data) {
                    if (data.redirect) return;

                    errorMessage = data.errorMessage;
                },
                dataType: 'json'
            }).done(function() {

                // if errorMessage is not null, display error shake animation with message
                if (errorMessage) {
                    $('#login-button').removeClass().addClass('shake-animation');

                    var el = $('#login-button');
                    var errorEl = $('#login-error-message');
                    var errorSpan = $('#login-error-message span');

                    // create identical element for next run of animation
                    newone = el.clone(true); 
                    el.before(newone);
                    el.remove();

                    // clear previous timeout if display is not 'none'
                    if (errorEl.css('display') != 'none') {
                        clearTimeout(errorEl.data('timeoutId'));
                        errorEl.removeData('timeoutId');
                        errorEl.hide();
                    }

                    // display error message
                    errorSpan.text(errorMessage);
                    errorEl.show();

                    var timeoutId = setTimeout(function() {
                        errorEl.removeData('timeoutId');
                        errorEl.hide();
                    }, 3000);

                    // persist timeoutId through DOM
                    errorEl.data('timeoutId', timeoutId);
                }

                // if errorMessage is null, redirect to home
                else {
                    window.location.href = '/home';
                }
            });
        }
    });

    // define register button functionality
    app.RegisterView = Backbone.View.extend({
        el: '#register-button',

        // register click and custom enter event on register button
        events: {
            'click': 'validateCredentials',
        },

        // login user with credentials
        validateCredentials: function() {
            var _email = $('#email').val();
            var _username = $('#register-username').val();
            var _password = $('#register-password').val();

            var errorMessage = null;

            // ajax POST request
            $.ajax({
                type: "POST",
                url: '/register/db',
                data: {
                    email: _email,
                    username: _username,
                    password: _password
                },
                success: function(data) {
                    if (data.redirect) return;

                    errorMessage = data.errorMessage;
                },
                dataType: 'json'
            }).done(function() {

                // if errorMessage is not null, display error shake animation with message
                if (errorMessage) {
                    $('#register-button').removeClass().addClass('shake-animation');

                    var el = $('#register-button');
                    var errorEl = $('#register-error-message');
                    var errorSpan = $('#register-error-message span');

                    // create identical element for next run of animation
                    newone = el.clone(true); 
                    el.before(newone);
                    el.remove();

                    // clear previous timeout if display is not 'none'
                    if (errorEl.css('display') != 'none') {
                        clearTimeout(errorEl.data('timeoutId'));
                        errorEl.removeData('timeoutId');
                        errorEl.hide();
                    }

                    // display error message
                    errorSpan.text(errorMessage);
                    errorEl.show();

                    var timeoutId = setTimeout(function() {
                        errorEl.removeData('timeoutId');
                        errorEl.hide();
                    }, 3000);

                    // persist timeoutId through DOM
                    errorEl.data('timeoutId', timeoutId);
                }

                // if errorMessage is null, redirect to home
                else {
                    window.location.href = '/home';
                }
            });
        }
    });

    return app;
});