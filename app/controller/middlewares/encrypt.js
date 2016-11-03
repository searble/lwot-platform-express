module.exports = function (serviceConfig) {
    return function (req, res, next) {
        var encrypt = function (str) {
            str = str + '';
            var crypto = require("crypto");
            var key = serviceConfig.encrypt.key;
            var cipher = crypto.createCipher('aes-256-cbc', key);
            var encipheredContent = cipher.update(str, 'utf8', 'hex');
            encipheredContent += cipher.final('hex');
            return encipheredContent;
        };

        req.encrypt = encrypt;

        next();
    };
};