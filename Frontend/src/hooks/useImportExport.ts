/**
 * Import/Export Utilities
 * Helper hooks and utilities for import/export functionality
 */

import { useState } from "react";
import {
  useImportDataMutation,
  useLazyExportDataQuery,
} from "@/redux/api/files/importExportApi";
import { toast } from "react-hot-toast";

/**
 * Hook for exporting data
 * Handles file download and error handling
 */
export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const [triggerExport] = useLazyExportDataQuery();

  const exportData = async (
    module: string,
    format: "csv" | "xlsx" | "pdf" = "xlsx",
    filters?: Record<string, any>,
  ) => {
    try {
      setIsExporting(true);
      console.log(`[EXPORT] Exporting ${module} as ${format}`, filters);

      const response = await triggerExport({
        module,
        format,
        ...filters,
      }).unwrap();

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;

      // Determine file extension
      const fileExtension =
        format === "csv" ? "csv" : format === "pdf" ? "pdf" : "xlsx";
      link.setAttribute(
        "download",
        `${module}-export-${Date.now()}.${fileExtension}`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    //   toast.success(`${module} exported successfully`);
    } catch (error: any) {
      console.error("[EXPORT ERROR]", error);
      if(error?.message){
        toast.error(error.message);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting,
  };
}

/**
 * Hook for importing data
 * Handles file upload and import process
 */
export function useImportData() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);
  const [importMutation] = useImportDataMutation();

  const importData = async (
    module: string,
    file: File,
    mode: "insert" | "update" | "merge" = "insert",
  ) => {
    try {
      setIsImporting(true);
      setImportProgress(0);
      setImportResult(null);

      console.log(`[IMPORT] Importing ${module} with mode: ${mode}`, file.name);

      // Create FormData with file and parameters
      const formData = new FormData();
      formData.append("module", module);
      formData.append("mode", mode);
      formData.append("file", file);

      // Send import request
      const result = await importMutation(formData).unwrap();

      setImportResult(result);
      setImportProgress(100);

      // Show result summary
      toast.success(
        `Import completed: ${result.data.successfulImports} succeeded, ${result.data.failedImports} failed`,
      );

      return result;
    } catch (error: any) {
      console.error("[IMPORT ERROR]", error);
      toast.error(error?.data?.message || "Failed to import data");
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importData,
    isImporting,
    importProgress,
    importResult,
  };
}

/**
 * Utility function to download a file
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Utility function to validate file before import
 */
export const validateImportFile = (
  file: File,
): { isValid: boolean; error?: string } => {
  const allowedMimes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ];

  const maxSize = 10 * 1024 * 1024; // 10 MB

  if (!file) {
    return { isValid: false, error: "No file selected" };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds 10 MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    };
  }

  if (!allowedMimes.includes(file.type) && !file.name.endsWith(".csv")) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed: XLSX, XLS, CSV. Received: ${file.type || "unknown"}`,
    };
  }

  return { isValid: true };
};

/**
 * Utility function to get export parameters
 */
export interface ExportParams {
  module: string;
  format?: "csv" | "xlsx";
  limit?: number;
  search?: string;
  status_id?: number;
  date_from?: string;
  date_to?: string;
}

export const createExportParams = (
  params: ExportParams,
): Record<string, any> => {
  const result: Record<string, any> = {
    module: params.module,
    format: params.format || "xlsx",
  };

  if (params.limit) result.limit = params.limit;
  if (params.search) result.search = params.search;
  if (params.status_id) result.status_id = params.status_id;
  if (params.date_from) result.date_from = params.date_from;
  if (params.date_to) result.date_to = params.date_to;

  return result;
};

/**
 * Supported modules for import/export
 */
export const IMPORT_EXPORT_MODULES = {
  QUOTATION: "quotation",
  INVOICE: "invoice",
  LEAD: "lead",
} as const;

export const IMPORT_MODES = {
  INSERT: "insert",
  UPDATE: "update",
  MERGE: "merge",
} as const;

export const EXPORT_FORMATS = {
  CSV: "csv",
  XLSX: "xlsx",
} as const;
