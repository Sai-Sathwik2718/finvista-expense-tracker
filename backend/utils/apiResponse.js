const httpStatus = require('../constants/httpStatus');

const successResponse = (res, statusCode = httpStatus.OK, message = 'Operation successful', data = null) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
    errors: null
  });
};

const errorResponse = (res, statusCode = httpStatus.INTERNAL_SERVER_ERROR, message = 'An error occurred', errors = null) => {
  return res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    data: null,
    errors: Array.isArray(errors) ? errors : (errors ? [errors] : null)
  });
};

module.exports = {
  successResponse,
  errorResponse
};
