const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../constants/httpStatus');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return errorResponse(res, httpStatus.UNPROCESSABLE_ENTITY, 'Validation failed', formattedErrors);
  }
  next();
};

module.exports = validate;
