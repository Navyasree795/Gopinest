/**
 * asyncHandler utility to wrap async routes and pass errors to the global error handler.
 * This eliminates the need for repeated try-catch blocks in controllers.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
