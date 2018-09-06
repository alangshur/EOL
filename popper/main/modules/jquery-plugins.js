/* JQUERY PLUGINS MODULE */

define(['jquery-main'], function($) {

    // PLUGIN - jQuery outerHTML function
    $.fn.extend({
        outerHTML: function (value) {

            // if there is no element in the jQuery object
            if (!this.length) return null;

            // returns the value
            else if (value === undefined) {
                var element = (this.length) ? this[0] : this, result;

                // return browser outerHTML (most newer browsers support it)
                if (element.outerHTML) {
                    result = element.outerHTML;
                }

                // return it using the jQuery solution
                else {
                    result = $(document.createElement("div")).append($(element).clone()).html();
                }

                // trim the result
                if (typeof result === "string") {
                    result = $.trim(result);
                }
                
                return result;
            } 
            else if ($.isFunction(value)) {

                // deal with functions
                this.each(function (i) {
                    var $this = $(this);
                    $this.outerHTML(value.call(this, i, $this.outerHTML()));
                });
            } 
            else {

                // replaces the content
                var $this = $(this),
                    replacingElements = [],
                    $value = $(value),
                    $cloneValue;

                for (var x = 0; x < $this.length; x++) {

                    // clone the value for each element being replaced
                    $cloneValue = $value.clone(true);

                    // use jQuery to replace the content
                    $this.eq(x).replaceWith($cloneValue);

                    // add the replacing content to the collection
                    for (var i = 0; i < $cloneValue.length; i++) replacingElements.push($cloneValue[i]);
                }

                // return the replacing content if any
                return (replacingElements.length) ? $(replacingElements) : null;
            }
        }
    });

    // PLUGIN - 'enter' keypress event
    $.fn.extend({
        loadEnterListener: function() {
            $('input').keypress(function(e) { 

                // add desired form names
                if (e.keyCode == 13 && ($(this).attr('name') == 'Password' || $(this).attr('name') == 'Search Bar')) {
                    $(this).trigger('enter');
                }
            });
        }
    });

    // PLUGIN - 'clicked' input data marker
    $.fn.extend({
        loadInputClickData: function() {
            $('input').click(function() {

                // add 'clicked: true' field to element data
                $(this).data('clicked', true);
            });
        }
    });

    // PLUGIN - uid generator
    $.fn.extend({
        uid: function() {
            return Math.random().toString(36).substr(2, 16);
        }
    });

    return $;
});
