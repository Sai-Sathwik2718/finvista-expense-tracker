const { errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../constants/httpStatus');

const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]:', err);

  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Database Validation Error';
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
  }

  return errorResponse(res, statusCode, message, errors);
};

module.exports = errorHandler;
