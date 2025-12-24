import config from "../config/index.js";

class ApiError extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Method to return JSON response
  toJSON() {
    return {
      success: false,
      message: this.message,
      statusCode: this.statusCode,
      stack: config.env === "development" ? this.stack : undefined,
    };
  }

  // Static method to handle the response
  static handleResponse(error, res) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(error.toJSON());
    }

    // Handle non-ApiError instances
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      statusCode: 500,
      stack: config.env === "development" ? error.stack : undefined,
    });
  }
}

export default ApiError;
