// export configured formatter package
module.exports.formatter = function()  {
    format = require('string-format');
    format.extend(String.prototype, {});
    
    return format;
}

module.exports.pathsys = function() {
    _path = require('path');
    _fs = require('fs');

    return {
        path: _path,
        fs: _path
    }
}