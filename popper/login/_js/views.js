define([
    'backbone',
    'jquery',
    'underscore',
    'format'
], function(Backbone, $, _, format) {
    var app = {};

    // define main login view
    app.LoginView = Backbone.View.extend({
        el: '#login-container',
        initialize: function() {
            this.render();
        },
        render: function() {
            this.template = _.template($('#login-template').html());
            this.$el.append(this.template);
        }
    });

    return app;
});