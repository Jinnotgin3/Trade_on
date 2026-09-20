const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
  })
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    // - Write all error-level logs to `error.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB limit
      maxFiles: 5
    }),
    // - Write all logs (info and below) to `combined.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB limit
      maxFiles: 5
    })
  ],
});

// Always log to the terminal as well
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    logFormat
  )
}));

module.exports = logger;
