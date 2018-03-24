var winston = require('winston');
var logger;

logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: `${__basedir}/wonka_api.log` })
    ]
  }
);

module.exports = logger;