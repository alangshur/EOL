/* STRING FORMAT MODULE */

// define format as string-format 'format' function
define(['string-format-min'], function(format) {
    format.extend(String.prototype, {});

    return format;
});