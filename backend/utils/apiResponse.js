/**
 * Standardized API Response Helper
 */
class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    if (data !== null && data !== undefined) {
      this.data = data;
    }
  }

  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data
    });
  }

  static error(res, message, statusCode = 500, errors = null) {
    console.error(`[API RESPONSE] Error: ${message} (${statusCode})`);
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors
    });
  }
}

module.exports = ApiResponse;
