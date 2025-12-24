export class ColumnMapper {
    static configs = {
        quotation: {
            // DB field → Display config
            quotation_number: {
                header: 'Quotation Number',
                dbField: 'quotation_number',
                type: 'string',
            },
            reference: {
                header: 'Reference',
                dbField: 'reference',
                type: 'string',
            },
            customer_name: {
                header: 'Customer Name',
                dbField: 'customer.firstName',
                type: 'string',
                formatter: (obj) =>
                    obj.customer
                        ? `${obj.customer.firstName} ${obj.customer.lastName}`
                        : '',
            },
            customer_email: {
                header: 'Customer Email',
                dbField: 'customer.email',
                type: 'string',
            },
            customer_phone: {
                header: 'Customer Phone',
                dbField: 'customer.phone',
                type: 'string',
            },
            issue_date: {
                header: 'Issue Date',
                dbField: 'issue_date',
                type: 'date',
                format: 'YYYY-MM-DD',
            },
            valid_until: {
                header: 'Valid Until',
                dbField: 'valid_until',
                type: 'date',
                format: 'YYYY-MM-DD',
            },
            currency: {
                header: 'Currency',
                dbField: 'currency',
                type: 'string',
            },
            tax_rate: {
                header: 'Tax Rate (%)',
                dbField: 'tax_rate',
                type: 'decimal',
            },
            tax_amount: {
                header: 'Tax Amount',
                dbField: 'tax_amount',
                type: 'decimal',
            },
            status: {
                header: 'Status',
                dbField: 'status.name',
                type: 'string',
            },
            notes: {
                header: 'Notes',
                dbField: 'notes',
                type: 'string',
            },
            terms: {
                header: 'Terms & Conditions',
                dbField: 'terms',
                type: 'string',
            },
            created_at: {
                header: 'Created Date',
                dbField: 'created_at',
                type: 'date',
                format: 'YYYY-MM-DD HH:mm:ss',
            },
        },

        invoice: {
            // DB field → Display config
            invoice_number: {
                header: 'Invoice Number',
                dbField: 'invoice_number',
                type: 'string',
            },
            reference: {
                header: 'Reference',
                dbField: 'reference',
                type: 'string',
            },
            quotation_number: {
                header: 'Quotation Number',
                dbField: 'quotation.quotation_number',
                type: 'string',
            },
            customer_name: {
                header: 'Customer Name',
                dbField: 'quotation.customer.firstName',
                type: 'string',
                formatter: (obj) =>
                    obj.quotation?.customer
                        ? `${obj.quotation.customer.firstName} ${obj.quotation.customer.lastName}`
                        : '',
            },
            customer_email: {
                header: 'Customer Email',
                dbField: 'quotation.customer.email',
                type: 'string',
            },
            customer_phone: {
                header: 'Customer Phone',
                dbField: 'quotation.customer.phone',
                type: 'string',
            },
            issue_date: {
                header: 'Issue Date',
                dbField: 'issue_date',
                type: 'date',
                format: 'YYYY-MM-DD',
            },
            due_date: {
                header: 'Due Date',
                dbField: 'due_date',
                type: 'date',
                format: 'YYYY-MM-DD',
            },
            currency: {
                header: 'Currency',
                dbField: 'currency',
                type: 'string',
            },
            discount_type: {
                header: 'Discount Type',
                dbField: 'discount_type',
                type: 'string',
            },
            discount_value: {
                header: 'Discount Value',
                dbField: 'discount_value',
                type: 'decimal',
            },
            tax_rate: {
                header: 'Tax Rate (%)',
                dbField: 'tax_rate',
                type: 'decimal',
            },
            tax_amount: {
                header: 'Tax Amount',
                dbField: 'tax_amount',
                type: 'decimal',
            },
            status: {
                header: 'Status',
                dbField: 'status.name',
                type: 'string',
            },
            payment_method: {
                header: 'Payment Method',
                dbField: 'payment_method.name',
                type: 'string',
            },
            payment_date: {
                header: 'Payment Date',
                dbField: 'payment_date',
                type: 'date',
                format: 'YYYY-MM-DD',
            },
            notes: {
                header: 'Notes',
                dbField: 'notes',
                type: 'string',
            },
            terms: {
                header: 'Terms & Conditions',
                dbField: 'terms',
                type: 'string',
            },
            created_at: {
                header: 'Created Date',
                dbField: 'created_at',
                type: 'date',
                format: 'YYYY-MM-DD HH:mm:ss',
            },
        },

        lead: {
            lead_number: {
                header: 'Lead Number',
                dbField: 'lead_number',
                type: 'string',
            },
            title: {
                header: 'Title',
                dbField: 'title',
                type: 'string',
            },
            first_name: {
                header: 'First Name',
                dbField: 'first_name',
                type: 'string',
            },
            last_name: {
                header: 'Last Name',
                dbField: 'last_name',
                type: 'string',
            },
            email: {
                header: 'Email',
                dbField: 'email',
                type: 'string',
            },
            phone: {
                header: 'Phone',
                dbField: 'phone',
                type: 'string',
            },
            company_name: {
                header: 'Company',
                dbField: 'company_name',
                type: 'string',
            },
            status: {
                header: 'Status',
                dbField: 'status.name',
                type: 'string',
            },
            source: {
                header: 'Source',
                dbField: 'source.name',
                type: 'string',
            },
            estimated_budget: {
                header: 'Estimated Budget',
                dbField: 'estimated_budget',
                type: 'decimal',
            },
            notes: {
                header: 'Notes',
                dbField: 'notes',
                type: 'string',
            },
        },
    };

    static getExportColumns(moduleName) {
        return this.configs[moduleName] || {};
    }


    static formatDataForExcel(record, moduleName) {
        let config = this.configs[moduleName];

        // Auto-generate if not configured
        if (!config) {
            config = this.autoGenerateConfig(moduleName, record);
        }

        if (!config) return record; // Fallback

        const row = {};
        Object.entries(config).forEach(([key, colConfig]) => {
            const value = this.getNestedValue(record, colConfig.dbField);

            if (colConfig.formatter) {
                row[colConfig.header] = colConfig.formatter(record, value);
            } else {
                row[colConfig.header] = this.formatValue(value, colConfig.type);
            }
        });
        return row;
    }


    static getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }


    static formatValue(value, type) {
        if (value === null || value === undefined) return '';

        switch (type) {
            case 'date':
                if (value instanceof Date) {
                    return value.toISOString().split('T')[0];
                }
                return value;
            case 'decimal':
                return parseFloat(value).toFixed(2);
            case 'boolean':
                return value ? 'Yes' : 'No';
            case 'number':
                return parseInt(value);
            default:
                return String(value);
        }
    }

    static formatDataForDB(excelRow, moduleName, sampleRecord = null) {
        let config = this.configs[moduleName];

        // Auto-generate if not configured
        if (!config && sampleRecord) {
            config = this.autoGenerateConfig(moduleName, sampleRecord);
        }

        if (!config) return excelRow; // Fallback

        const record = {};
        Object.entries(config).forEach(([dbKey, colConfig]) => {
            const excelValue = excelRow[colConfig.header];

            if (excelValue !== undefined && excelValue !== '') {
                const parsedValue = this.parseValue(excelValue, colConfig.type);
                record[colConfig.dbField] = parsedValue;
            }
        });
        return record;
    }

    static parseValue(value, type) {
        if (value === '' || value === null) return null;

        switch (type) {
            case 'date':
                const date = new Date(value);
                return isNaN(date.getTime()) ? null : date;
            case 'decimal':
                const decimal = parseFloat(value);
                return isNaN(decimal) ? null : decimal;
            case 'boolean':
                return value === 'Yes' || value === true;
            case 'number':
                const num = parseInt(value);
                return isNaN(num) ? null : num;
            default:
                return value;
        }
    }


    static autoGenerateConfig(moduleName, sampleRecord) {
        if (this.configs[moduleName]) {
            return this.configs[moduleName]; // Use existing config
        }

        // Create basic config from object keys
        const config = {};
        if (sampleRecord && typeof sampleRecord === 'object') {
            Object.keys(sampleRecord).forEach((key) => {
                // Skip sensitive fields
                if (['password', 'id'].includes(key)) {
                    return;
                }

                // Convert field name to Title Case (handles both camelCase and snake_case)
                const header = this.fieldNameToTitleCase(key);

                config[key] = {
                    header,
                    dbField: key,
                    type: this.detectType(sampleRecord[key]),
                };
            });
        }

        // Cache it for future use
        if (Object.keys(config).length > 0) {
            this.configs[moduleName] = config;
        }

        return config;
    }

    static fieldNameToTitleCase(str) {
        let titleCase;

        // Check if it's snake_case (contains underscores)
        if (str.includes('_')) {
            // snake_case → Title Case
            titleCase = str
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        } else {
            // camelCase → Title Case
            titleCase = str
                .replace(/([A-Z])/g, ' $1') // Add space before capitals
                .replace(/^./, (char) => char.toUpperCase()) // Capitalize first letter
                .trim();
        }

        return titleCase;
    }


    static camelCaseToTitleCase(str) {
        return this.fieldNameToTitleCase(str);
    }


    static detectType(value) {
        if (value === null || value === undefined) return 'string';
        if (value instanceof Date) return 'date';
        if (typeof value === 'number') {
            return value % 1 === 0 ? 'number' : 'decimal';
        }
        if (typeof value === 'boolean') return 'boolean';
        return 'string';
    }


    static getHeaders(moduleName, sampleRecord = null) {
        let config = this.configs[moduleName];

        // If no config exists, try to auto-generate
        if (!config && sampleRecord) {
            config = this.autoGenerateConfig(moduleName, sampleRecord);
        }

        config = config || {};
        return Object.values(config).map((col) => col.header);
    }


    static getColumnOrder(moduleName) {
        const config = this.configs[moduleName] || {};
        return Object.keys(config);
    }


    static addCustomConfig(moduleName, customConfig) {
        this.configs[moduleName] = {
            ...this.configs[moduleName],
            ...customConfig,
        };
    }


    static setCustomConfig(moduleName, customConfig) {
        this.configs[moduleName] = customConfig;
    }


    static getDBField(moduleName, excelHeader) {
        const config = this.configs[moduleName];
        if (!config) return null;

        const found = Object.entries(config).find(
            ([_, col]) => col.header === excelHeader
        );
        return found ? found[1].dbField : null;
    }


    static getMappingInfo(moduleName) {
        const config = this.configs[moduleName] || {};
        return Object.entries(config).map(([key, col]) => ({
            key,
            header: col.header,
            dbField: col.dbField,
            type: col.type,
        }));
    }
}
