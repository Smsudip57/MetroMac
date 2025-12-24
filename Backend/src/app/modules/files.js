import { FileManager } from "../../helpers/FilleManager.js";
import ResponseFormatter from "../../helpers/responseFormater.js";
import ApiError from "../../errors/ApiError.js";

async function saveTempFile(req, res, next) {
  try {
    const { file } = req;
    if (!file) {
      return ResponseFormatter.error(
        res,
        new ApiError(400, "No file uploaded")
      );
    }
    const result = await FileManager.Temp(file);
    return ResponseFormatter.success(res, result, "File uploaded successfully");
  } catch (error) {
    next(error);
  }
}

export { saveTempFile };
