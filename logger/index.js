const { createLogger, transports, format, config } = require('winston');

const customFormat = format.combine(
    format.timestamp(),
    format.printf(info => {
        return `${info.timestamp}-[${info.level.toUpperCase().padEnd(7)}] - ${
            info.message
        }`;
    })
);

const logger = createLogger({
    format: customFormat,
    levels: config.npm.levels,
    transports: [new transports.Console()],
});

module.exports = logger;
