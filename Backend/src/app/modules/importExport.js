import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import ResponseFormatter from "../../helpers/responseFormater.js";
import ApiError from "../../errors/ApiError.js";
import { ExcelExporter } from "../../helpers/ExcelExporter.js";
import { ExcelImporter } from "../../helpers/ExcelImporter.js";
import { ColumnMapper } from "../../helpers/ExcelColumnMapper.js";
import { PDFExporter } from "../../helpers/PDFExporter.js";
import { PDFTemplates } from "../../templates/pdfTemplates.js";
import pdfService from "../services/pdfService.js";
import Papa from "papaparse";
import { buildTaskFilters } from "./tasks.js";

const prisma = new PrismaClient();

async function exportData(req, res, next) {
  try {
    const { module, format = "xlsx", ...filters } = req.query;

    console.log(
      `[EXPORT] Module: ${module}, Format: ${format}, Filters:`,
      filters,
    );

    if (!module) {
      return ResponseFormatter.error(
        res,
        new ApiError(StatusCodes.BAD_REQUEST, "Module name is required"),
      );
    }

    const validFormats = ["csv", "xlsx", "pdf"];
    if (!validFormats.includes(format?.toLowerCase())) {
      return ResponseFormatter.error(
        res,
        new ApiError(
          StatusCodes.BAD_REQUEST,
          `Format must be one of: ${validFormats.join(", ")}`,
        ),
      );
    }

    // Fetch data based on module (supports: search, status, assigned_to, assigned_by, reporter_id, fromDate, toDate, sortBy, sortOrder, showArchived, limit)
    let data = await fetchDataByModule(module, filters, req.user);

    // Apply status-based filtering for tasks to ensure report consistency
    // This prevents data inconsistency when tasks status is changed after submission/completion
    if (module?.toLowerCase() === "task") {
      data = data.map((task) => {
        const taskCopy = { ...task };

        // Only keep submission_date if status is submitted or completed
        if (!["submitted", "completed"].includes(task.status)) {
          taskCopy.submission_date = null;
        }

        // Only keep completion_date if status is completed
        if (task.status !== "completed") {
          taskCopy.completion_date = null;
        }

        return taskCopy;
      });
    }

    if (!data || data.length === 0) {
      return ResponseFormatter.error(
        res,
        new ApiError(
          StatusCodes.NOT_FOUND,
          `No records found for module: ${module}`,
        ),
      );
    }

    console.log(`[EXPORT] Found ${data.length} records for export`);

    // Generate file based on format
    let buffer, contentType, filename;

    if (format?.toLowerCase() === "xlsx") {
      buffer = await ExcelExporter.export({
        data,
        moduleName: module,
        fileName: module,
      });
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      filename = `${module}-export-${Date.now()}.xlsx`;
    } else if (format?.toLowerCase() === "pdf") {
      // PDF format
      let htmlContent;
      let formattedData;

      if (module?.toLowerCase() === "task") {
        formattedData = PDFExporter.formatTasksForPDF(data);
        const summary = PDFTemplates.calculateSummary(formattedData, "task");
        htmlContent = PDFTemplates.taskReport(formattedData, summary);
      } else {
        return ResponseFormatter.error(
          res,
          new ApiError(
            StatusCodes.BAD_REQUEST,
            `PDF export is only supported for tasks module`,
          ),
        );
      }

      buffer = await pdfService.generatePDF(htmlContent, {
        format: "A4",
        margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      });
      contentType = "application/pdf";
      filename = `${module}-export-${Date.now()}.pdf`;
    } else {
      // CSV format
      buffer = await exportToCSV(data, module);
      contentType = "text/csv";
      filename = `${module}-export-${Date.now()}.csv`;
    }

    // Send file as response
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);

    console.log(`[EXPORT] File sent: ${filename}`);
  } catch (error) {
    console.error("[EXPORT ERROR]", error);
    next(error);
  }
}

async function importData(req, res, next) {
  try {
    const { module, mode = "insert" } = req.body;

    console.log(`[IMPORT] Module: ${module}, Mode: ${mode}`);

    if (!module) {
      return ResponseFormatter.error(
        res,
        new ApiError(StatusCodes.BAD_REQUEST, "Module name is required"),
      );
    }

    if (!req.file) {
      return ResponseFormatter.error(
        res,
        new ApiError(StatusCodes.BAD_REQUEST, "File is required"),
      );
    }

    const validModes = ["insert", "update", "merge"];
    if (!validModes.includes(mode?.toLowerCase())) {
      return ResponseFormatter.error(
        res,
        new ApiError(
          StatusCodes.BAD_REQUEST,
          `Mode must be one of: ${validModes.join(", ")}`,
        ),
      );
    }

    ExcelImporter.validateFile(req.file);

    console.log(
      `[IMPORT] File received: ${req.file.originalname} (${req.file.size} bytes)`,
    );

    let importResult;

    if (
      req.file.mimetype === "text/csv" ||
      req.file.originalname.endsWith(".csv")
    ) {
      importResult = await parseCSVFile(req.file.buffer, module);
    } else {
      importResult = await ExcelImporter.import({
        fileBuffer: req.file.buffer,
        moduleName: module,
        skipHeader: true,
      });
    }

    console.log(
      `[IMPORT] Parsed records: ${importResult.records.length}, Errors: ${importResult.errors.length}`,
    );

    if (importResult.errors.length > 0 && importResult.records.length === 0) {
      return ResponseFormatter.error(
        res,
        new ApiError(
          StatusCodes.BAD_REQUEST,
          "File parsing failed - no valid records found",
          { errors: importResult.errors.slice(0, 10) }, // Show first 10 errors
        ),
      );
    }

    // Process records based on mode
    const processResult = await processImportedRecords(
      importResult.records,
      module,
      mode,
    );

    console.log(
      `[IMPORT] Processed - Success: ${processResult.success}, Failed: ${processResult.failed}`,
    );

    return ResponseFormatter.success(
      res,
      {
        module,
        mode,
        totalRecords: importResult.records.length,
        successfulImports: processResult.success,
        failedImports: processResult.failed,
        errors: processResult.errors.slice(0, 20), // Show first 20 errors
        warnings: importResult.errors.slice(0, 10), // Show first 10 parsing warnings
        timestamp: new Date().toISOString(),
      },
      `Import completed: ${processResult.success} succeeded, ${processResult.failed} failed`,
    );
  } catch (error) {
    console.error("[IMPORT ERROR]", error);
    next(error);
  }
}

async function getImportExportConfig(req, res, next) {
  try {
    const { module } = req.params;

    console.log(`[CONFIG] Fetching config for module: ${module}`);

    if (!module) {
      return ResponseFormatter.error(
        res,
        new ApiError(StatusCodes.BAD_REQUEST, "Module name is required"),
      );
    }

    const columns = ColumnMapper.getExportColumns(module);

    if (!columns || Object.keys(columns).length === 0) {
      return ResponseFormatter.error(
        res,
        new ApiError(
          StatusCodes.BAD_REQUEST,
          `No configuration found for module: ${module}`,
        ),
      );
    }

    const mappingInfo = ColumnMapper.getMappingInfo(module);

    return ResponseFormatter.success(
      res,
      {
        module,
        totalColumns: mappingInfo.length,
        columns: mappingInfo,
        supportedFormats: ["csv", "xlsx", "pdf"],
        supportedModes: ["insert", "update", "merge"],
      },
      "Configuration retrieved successfully",
    );
  } catch (error) {
    console.error("[CONFIG ERROR]", error);
    next(error);
  }
}

async function fetchDataByModule(module, filters, user) {
  switch (module?.toLowerCase()) {
    case "task":
      // Use buildTaskFilters for consistent filtering logic with getTasks endpoint
      const where = buildTaskFilters(
        filters,
        user?.id,
        user?.role,
        user?.is_super_user,
      );

      // Build orderBy dynamically (same as getTasks)
      const validSortFields = [
        "title",
        "description",
        "status",
        "start_date",
        "end_date",
        "submission_date",
        "completion_date",
        "created_at",
        "updated_at",
        "assigned_to",
        "assigned_by",
      ];
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder || "desc";
      const finalSortBy = validSortFields.includes(sortBy)
        ? sortBy
        : "created_at";
      const finalSortOrder = ["asc", "desc"].includes(sortOrder?.toLowerCase())
        ? sortOrder.toLowerCase()
        : "desc";

      // Map assigned_by to created_by for sorting
      const sortField = finalSortBy === "assigned_by" ? "created_by" : finalSortBy;

      let orderBy = {};

      // For user-based sorting (assigned_to, assigned_by/created_by), sort by firstName
      if (finalSortBy === "assigned_to" || finalSortBy === "assigned_by") {
        const userRelation = finalSortBy === "assigned_to" ? "assignee" : "creator";
        orderBy = [
          { [userRelation]: { firstName: finalSortOrder } },
          { created_at: "desc" }, // Secondary sort by created_at
        ];
      }
      // For description, sort by first character - put non-NULL values first, then NULLs
      else if (finalSortBy === "description") {
        // Sort by: non-NULL descriptions first (alphabetically), then NULL descriptions
        orderBy = [
          { description: { not: null } },  // Non-NULL descriptions come first
          { description: finalSortOrder }, // Then sort alphabetically
          { created_at: "desc" },          // Secondary sort by created_at
        ];
      }
      // For submission_date and completion_date, handle NULL values properly
      else if (
        sortField === "submission_date" ||
        sortField === "completion_date"
      ) {
        // PostgreSQL: NULL values go last by default in ASC, first in DESC
        // We want NULL values to always go last for better UX
        orderBy = [
          { [sortField]: { sort: finalSortOrder, nulls: "last" } },
          { created_at: "desc" }, // Secondary sort by created_at
        ];
      } else {
        orderBy = { [sortField]: finalSortOrder };
      }

      return await prisma.task.findMany({
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              email: true,
              profileImage: true,
            },
          },
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              email: true,
              profileImage: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              email: true,
              profileImage: true,
            },
          },
          taskAlerts: true,
          comments: { select: { id: true } },
          attachments: { select: { id: true } },
        },
        take: parseInt(filters.limit) || 1000,
        where,
        orderBy,
      });

    default:
      throw new Error(`Unsupported module: ${module}`);
  }
}

async function exportToCSV(data, module) {
  const columns = ColumnMapper.getExportColumns(module);

  const formattedData = data.map((record) =>
    ColumnMapper.formatDataForExcel(record, module),
  );

  const headers = Object.values(columns).map((col) => col.header);

  // Ensure all records have all fields (Papa.unparse requires consistent keys)
  const normalizedData = formattedData.map((row) => {
    const normalizedRow = {};
    headers.forEach((header) => {
      normalizedRow[header] = row[header] || "";
    });
    return normalizedRow;
  });

  const csv = Papa.unparse({
    fields: headers,
    data: normalizedData,
  });

  return Buffer.from(csv, "utf-8");
}

async function parseCSVFile(fileBuffer, module) {
  return new Promise((resolve, reject) => {
    const csvString = fileBuffer.toString("utf-8");

    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        const records = [];
        const errors = [];
        const columns = ColumnMapper.getExportColumns(module);

        results.data.forEach((row, index) => {
          try {
            if (!row || Object.keys(row).every((k) => !row[k])) {
              return; // Skip empty rows
            }

            const dbRecord = ColumnMapper.formatDataForDB(row, module);
            records.push({
              rowNumber: index + 2, // +2 because CSV header is row 1
              data: dbRecord,
              rawExcel: row,
              status: "pending",
            });
          } catch (error) {
            errors.push({
              rowNumber: index + 2,
              error: error.message,
              data: row,
            });
          }
        });

        resolve({
          records,
          errors,
          total: records.length,
          totalErrors: errors.length,
          timestamp: new Date().toISOString(),
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

async function processImportedRecords(records, module, mode) {
  const result = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (const record of records) {
    try {
      switch (module?.toLowerCase()) {
        default:
          throw new Error(`Unsupported module: ${module}`);
      }
      result.success++;
      record.status = "imported";
    } catch (error) {
      result.failed++;
      record.status = "failed";
      result.errors.push({
        row: record.rowNumber,
        message: error.message,
        data: record.data,
      });
    }
  }

  return result;
}

export { exportData, importData, getImportExportConfig };
