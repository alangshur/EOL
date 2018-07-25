// define format as string-format 'format' function
define('format', ['string-format-min'], function(format) {
    format.extend(String.prototype, {});

    return format;
});