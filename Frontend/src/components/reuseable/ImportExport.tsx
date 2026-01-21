"use client";

import React, { useState, useRef } from "react";
import {
  Download,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  useExportData,
  useImportData,
  validateImportFile,
} from "@/hooks/useImportExport";
import FormSelect from "./forms/WithoutHookForm/FormSelect";
import { toast } from "react-hot-toast";

interface ImportExportProps {
  module: "task";
  filters?: any;
  onImportSuccess?: (result: any) => void;
  onExportSuccess?: () => void;
}

export default function ImportExport({
  module,
  filters,
  onImportSuccess,
  onExportSuccess,
}: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv" | "pdf">(
    "xlsx",
  );

  const { exportData, isExporting } = useExportData();
  const { importData, isImporting, importResult } = useImportData();

  // Handle export button click
  const handleExport = async () => {
    if (isExporting || isImporting) return; // Prevent multiple clicks
    try {
      await exportData(module, exportFormat, filters);
      onExportSuccess?.();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImportFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    // Auto-import with merge mode
    importData(module, file, "merge").then(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  };

  // Handle import icon click
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const exportFormatOptions = [
    { value: "xlsx", label: "Excel (XLSX)" },
    { value: "csv", label: "CSV" },
    { value: "pdf", label: "PDF" },
  ];

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Format Selector */}
      <div className="flex-1 max-w-xs">
        <FormSelect
          label=""
          options={exportFormatOptions}
          value={exportFormat}
          onChange={(value) => setExportFormat(value as "xlsx" | "csv" | "pdf")}
          placeholder="Select format"
          triggerClassName="h-[30px] !text-xs px-3 py-4 rounded-lg"
          optionsClassName="!text-xs"
          disabled={isExporting || isImporting}
        />
      </div>

      {/* Export Icon Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || isImporting}
        className="flex items-center justify-center w-8 h-8 rounded-lg  border border-border hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        title="Export"
      >
        {isExporting ? (
          <span className="animate-spin text-primary">⟳</span>
        ) : (
          <Download className="w-3.5 h-3.5 text-primary" />
        )}
      </button>

      {/* Import Icon Button */}
      {/* <button
        onClick={handleImportClick}
        disabled={isImporting || isExporting}
        className="flex items-center justify-center w-8 h-8 rounded-lg  border border-border hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        title="Import"
      >
        {isImporting ? (
          <span className="animate-spin text-primary">⟳</span>
        ) : (
          <Upload className="w-3.5 h-3.5 text-primary" />
        )}
      </button> */}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isImporting}
      />

      {/* Import Result Display */}
      {importResult && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg_shade rounded-lg  p-4 space-y-3 shadow-lg z-50">
          <div className="flex items-start gap-3">
            {importResult.data.failedImports === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h5 className="font-medium text-text_highlight">
                Import Summary
              </h5>
              <p className="text-sm text-text mt-1">
                {importResult.data.successfulImports} of{" "}
                {importResult.data.totalRecords} records imported successfully
              </p>
            </div>
          </div>

          {/* Error Details */}
          {importResult.data.failedImports > 0 &&
            importResult.data.errors.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm font-medium text-text_highlight mb-2">
                  Errors ({importResult.data.errors.length})
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {importResult.data.errors
                    .slice(0, 5)
                    .map((error: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-xs text-text bg-bg rounded p-2"
                      >
                        <p className="font-medium">
                          Row {error.row}: {error.message}
                        </p>
                      </div>
                    ))}
                  {importResult.data.errors.length > 5 && (
                    <p className="text-xs text-text opacity-70 pt-2">
                      ... and {importResult.data.errors.length - 5} more errors
                    </p>
                  )}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
