import ExcelJS from 'exceljs';
import { ColumnMapper } from './ExcelColumnMapper.js';

export class ExcelExporter {
    /**
     * Export data to Excel buffer
     * @param {Object} options - Export options
     * @param {Array} options.data - Array of records to export
     * @param {string} options.moduleName - Module name (quotation, invoice, lead, etc.)
     * @param {string} options.fileName - Name for the exported file
     * @param {Object} options.styling - Optional styling config
     * @returns {Promise<Buffer>} Excel file buffer
     */
    static async export(options) {
        const {
            data = [],
            moduleName,
            fileName = 'export',
            styling = {},
        } = options;

        if (!moduleName) {
            throw new Error('moduleName is required for export');
        }

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('data must be a non-empty array');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Get headers from mapper (auto-generate if not configured)
        let headers = ColumnMapper.getHeaders(moduleName);
        if (headers.length === 0 && data.length > 0) {
            // Auto-generate config from first record
            console.log(`[EXPORT] Auto-generating config for module: ${moduleName}`);
            headers = ColumnMapper.getHeaders(moduleName, data[0]);
        }

        if (headers.length === 0) {
            throw new Error(`No column configuration found for module: ${moduleName}`);
        }

        // Set up columns with auto-width
        worksheet.columns = headers.map((header) => ({
            header,
            key: header,
            width: Math.min(Math.max(header.length + 2, 15), 50), // Auto width, min 15, max 50
        }));

        // Format header row with styling
        const headerRow = worksheet.getRow(1);
        headerRow.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' },
            size: 11,
        };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }, // Blue background
        };
        headerRow.alignment = {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true,
        };

        // Add data rows
        data.forEach((record, index) => {
            try {
                const formattedRow = ColumnMapper.formatDataForExcel(
                    record,
                    moduleName
                );
                const row = worksheet.addRow(formattedRow);

                // Optional: Alternate row colors for readability
                if (index % 2 === 1) {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF2F2F2' }, // Light gray
                    };
                }

                // Format cells based on column type
                row.eachCell((cell, colNumber) => {
                    const header = headers[colNumber - 1];
                    const config = ColumnMapper.getExportColumns(moduleName);
                    const colConfig = Object.values(config).find(
                        (c) => c.header === header
                    );

                    if (colConfig) {
                        switch (colConfig.type) {
                            case 'date':
                                cell.numFmt = 'yyyy-mm-dd';
                                cell.alignment = { horizontal: 'center' };
                                break;
                            case 'decimal':
                                cell.numFmt = '0.00';
                                cell.alignment = { horizontal: 'right' };
                                break;
                            case 'number':
                                cell.numFmt = '0';
                                cell.alignment = { horizontal: 'right' };
                                break;
                            default:
                                cell.alignment = { horizontal: 'left', wrapText: true };
                        }
                    }
                });
            } catch (error) {
                console.warn(`Error formatting row ${index + 2}:`, error.message);
                // Continue with next row even if one fails
            }
        });

        // Freeze header row
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];

        // Add summary footer
        const lastRow = worksheet.rowCount + 2;
        const summaryRow = worksheet.getRow(lastRow);
        summaryRow.getCell(1).value = `Total Records: ${data.length}`;
        summaryRow.getCell(1).font = { bold: true };
        summaryRow.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE7E6E6' },
        };

        // Add export metadata
        worksheet.properties.date1904 = false;

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }

    /**
     * Export data with custom column configuration
     * Useful for modules that need special handling
     */
    static async exportWithCustomConfig(options) {
        const { data, moduleName, customColumns, fileName } = options;

        // Temporarily add custom config
        const originalConfig = ColumnMapper.configs[moduleName];
        ColumnMapper.setCustomConfig(moduleName, customColumns);

        try {
            const buffer = await this.export({
                data,
                moduleName,
                fileName,
            });
            return buffer;
        } finally {
            // Restore original config
            if (originalConfig) {
                ColumnMapper.configs[moduleName] = originalConfig;
            }
        }
    }
}
