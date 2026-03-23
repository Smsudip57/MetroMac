import multer from "multer";
import ApiError from "../../errors/ApiError.js";
import ResponseFormatter from "../../helpers/responseFormater.js";

/**
 * Multer error handler middleware
 * Handles file size and type validation errors
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return ResponseFormatter.error(
        res,
        new ApiError(400, "File size must be below 50MB"),
      );
    }
  }
  if (err) {
    return ResponseFormatter.error(res, new ApiError(400, err.message));
  }
  next();
};

export { handleMulterError };
