const errorHandler = (err, req, res, next) => {
  // Ultra-Granular Error Logging
  console.error('\n\x1b[41m\x1b[37m [FATAL ERROR] \x1b[0m');
  console.error(`\x1b[31mMessage:\x1b[0m ${err.message}`);
  console.error(`\x1b[31mStack:\x1b[0m ${err.stack}`);
  console.error(`\x1b[31mPath:\x1b[0m ${req.method} ${req.url}`);
  console.error(`\x1b[31mBody:\x1b[0m`, JSON.stringify(req.body, null, 2));
  console.error('\x1b[41m\x1b[37m [END ERROR] \x1b[0m\n');

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Ensure JSON response
  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
