import ApiError from "../errors/ApiError.js";
class ResponseFormatter {
  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
    });
  }
  static error(res, error) {
    return ApiError.handleResponse(error, res);
  }
  static paginated(
    res,
    data,
    pagination,
    message = "Data fetched successfully",
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      statusCode,
      pagination: {
        currentPage: pagination.page || 1,
        pageSize: pagination.limit || 10,
        totalRecords: pagination.totalCount || 0,
        totalPages: pagination.totalPages || 0,
        hasNext: pagination.hasNext || false,
        hasPrevious: pagination.hasPrevious || false,
      },
      timestamp: new Date().toISOString(),
    });
  }
  static created(res, data, message = "Resource created successfully") {
    return this.success(res, data, message, 201);
  }

  static updated(res, data, message = "Resource updated successfully") {
    return this.success(res, data, message, 200);
  }

  static deleted(res, message = "Resource deleted successfully") {
    return this.success(res, null, message, 200);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

export default ResponseFormatter;
