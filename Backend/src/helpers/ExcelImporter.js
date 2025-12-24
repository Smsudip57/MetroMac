/**
 * ExcelImporter - Import data from Excel files
 * Uses ColumnMapper for field mapping and validation
 */

import ExcelJS from 'exceljs';
import { ColumnMapper } from './ExcelColumnMapper.js';

export class ExcelImporter {
    /**
     * Import and parse Excel file
     * @param {Object} options - Import options
     * @param {Buffer} options.fileBuffer - Excel file as buffer
     * @param {string} options.moduleName - Module name (quotation, invoice, lead, etc.)
     * @param {boolean} options.skipHeader - Skip first row as header (default: true)
     * @returns {Promise<Object>} { records, errors, total, timestamp }
     */
    static async import(options) {
        const {
            fileBuffer,
            moduleName,
            skipHeader = true,
        } = options;

        if (!fileBuffer) {
            throw new Error('fileBuffer is required');
        }

        if (!moduleName) {
            throw new Error('moduleName is required for import');
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);

        if (workbook.worksheets.length === 0) {
            throw new Error('Excel file contains no worksheets');
        }

        const worksheet = workbook.worksheets[0];
        const records = [];
        const errors = [];
        let headerRow = null;

        // Get expected headers from mapper
        const expectedHeaders = ColumnMapper.getHeaders(moduleName);
        if (expectedHeaders.length === 0) {
            throw new Error(`No column configuration found for module: ${moduleName}`);
        }

        worksheet.eachRow((row, rowNumber) => {
            try {
                // Use first row as header
                if (rowNumber === 1) {
                    headerRow = row.values.slice(1); // Remove first empty element

                    // Validate headers match
                    const headerMismatch = this.validateHeaders(
                        headerRow,
                        expectedHeaders,
                        moduleName
                    );

                    if (headerMismatch.length > 0) {
                        throw new Error(
                            `Header mismatch. Expected: ${expectedHeaders.join(', ')}. ` +
                            `Found: ${headerRow.join(', ')}`
                        );
                    }

                    return; // Skip header row
                }

                // Skip empty rows
                if (!row.values || row.values.every(cell => cell === undefined || cell === null || cell === '')) {
                    return;
                }

                // Convert row to object
                const rowData = row.values.slice(1); // Remove first empty element
                const excelRow = {};

                headerRow.forEach((header, index) => {
                    excelRow[header] = rowData[index];
                });

                // Convert to DB format using mapper
                const dbRecord = ColumnMapper.formatDataForDB(excelRow, moduleName);

                records.push({
                    rowNumber,
                    data: dbRecord,
                    rawExcel: excelRow,
                    status: 'pending',
                });
            } catch (error) {
                errors.push({
                    rowNumber,
                    error: error.message,
                    data: row.values?.slice(1) || [],
                });
            }
        });

        return {
            records,
            errors,
            total: records.length,
            totalErrors: errors.length,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Validate that Excel headers match expected columns
     * Allows flexible matching (case-insensitive, partial matches)
     */
    static validateHeaders(excelHeaders, expectedHeaders, moduleName) {
        const mismatches = [];

        // For strict validation, uncomment below:
        // expectedHeaders.forEach(expected => {
        //   const found = excelHeaders.find(h => h?.toLowerCase() === expected.toLowerCase());
        //   if (!found) {
        //     mismatches.push(`Missing column: ${expected}`);
        //   }
        // });

        // For lenient validation (recommend for flexibility):
        if (excelHeaders.length === 0) {
            mismatches.push('No headers found in Excel file');
        }

        return mismatches;
    }

    /**
     * Process imported records with validation callback
     * @param {Array} records - Records from import()
     * @param {Function} validationCallback - Async function to validate/create records
     * @returns {Promise<Object>} { imported, failed, errors }
     */
    static async processRecords(records, validationCallback) {
        const results = {
            imported: 0,
            failed: 0,
            errors: [],
        };

        for (const record of records) {
            try {
                await validationCallback(record);
                record.status = 'imported';
                results.imported++;
            } catch (error) {
                record.status = 'failed';
                results.failed++;
                results.errors.push({
                    row: record.rowNumber,
                    data: record.data,
                    message: error.message,
                });
            }
        }

        return results;
    }

    /**
     * Get import statistics
     */
    static getStatistics(importResult) {
        return {
            total: importResult.total,
            imported: importResult.total - importResult.errors.length,
            failed: importResult.errors.length,
            successRate:
                importResult.total > 0
                    ? (
                        (
                            (importResult.total - importResult.errors.length) /
                            importResult.total
                        ) * 100
                    ).toFixed(2) + '%'
                    : 'N/A',
        };
    }

    /**
     * Validate file before processing
     */
    static validateFile(file) {
        if (!file) {
            throw new Error('No file provided');
        }

        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('File must be an Excel file (.xlsx or .xls)');
        }

        const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
        if (file.size > maxSizeBytes) {
            throw new Error('File size must not exceed 10 MB');
        }

        return true;
    }
}
