module.exports = function (serviceConfig) {
    return function (req, res, next) {
        var sendmail = function (to, subject, html, cb) {
            var mailserver = {
                user: serviceConfig.sendmail.user,
                password: serviceConfig.sendmail.password,
                host: serviceConfig.sendmail.host,
                ssl: serviceConfig.sendmail.ssl
            };

            var emailjs = require('emailjs');
            var mail = emailjs.server.connect(mailserver);

            mail.send({
                from: config.from,
                to: to,
                subject: subject,
                text: '',
                attachment: {
                    data: html,
                    alternative: true
                }
            }, function (err) {
                cb(err);
            });
        };

        req.sendmail = sendmail;

        next();
    };
};