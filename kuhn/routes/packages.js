// export configured formatter package
module.exports.formatter = function()  {
    format = require('string-format');
    format.extend(String.prototype, {});
    
    return format;
}