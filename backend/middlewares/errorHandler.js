const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};

module.exports = errorHandler;
