const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../constants/httpStatus');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, httpStatus.UNAUTHORIZED, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return errorResponse(res, httpStatus.UNAUTHORIZED, 'Invalid token. User no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, httpStatus.UNAUTHORIZED, 'Invalid or expired authentication token.');
  }
};

module.exports = { authenticate };
