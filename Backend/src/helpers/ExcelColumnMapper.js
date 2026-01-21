export class ColumnMapper {
  static configs = {
    task: {
      title: {
        header: "Task Title",
        dbField: "title",
        type: "string",
      },
      description: {
        header: "Description",
        dbField: "description",
        type: "string",
      },
      status: {
        header: "Status",
        dbField: "status",
        type: "string",
        formatter: (obj) =>
          obj.status
            ? obj.status.charAt(0).toUpperCase() +
              obj.status.slice(1).replace(/_/g, " ")
            : "",
      },
      assigned_to_name: {
        header: "Assigned To",
        dbField: "assignee",
        type: "string",
        formatter: (obj) =>
          obj.assignee
            ? `${obj.assignee.firstName} ${obj.assignee.lastName}`
            : "-",
      },
      reporter_name: {
        header: "Assigned By",
        dbField: "reporter",
        type: "string",
        formatter: (obj) =>
          obj.reporter
            ? `${obj.reporter.firstName} ${obj.reporter.lastName}`
            : "-",
      },
      start_date: {
        header: "Start Date",
        dbField: "start_date",
        type: "date",
        format: "YYYY-MM-DD",
      },
      end_date: {
        header: "End Date",
        dbField: "end_date",
        type: "date",
        format: "YYYY-MM-DD",
      },
      submission_date: {
        header: "Submitted Date",
        dbField: "submission_date",
        type: "date",
        format: "YYYY-MM-DD",
      },
      completion_date: {
        header: "Completed Date",
        dbField: "completion_date",
        type: "date",
        format: "YYYY-MM-DD",
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
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  }

  static formatValue(value, type) {
    if (value === null || value === undefined) return "";

    switch (type) {
      case "date":
        if (value instanceof Date) {
          return value.toISOString().split("T")[0];
        }
        if (typeof value === "string") {
          // Handle ISO string or other date formats
          return value.split("T")[0];
        }
        return value;
      case "decimal":
        return parseFloat(value).toFixed(2);
      case "boolean":
        return value ? "Yes" : "No";
      case "number":
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

      if (excelValue !== undefined && excelValue !== "") {
        const parsedValue = this.parseValue(excelValue, colConfig.type);
        record[colConfig.dbField] = parsedValue;
      }
    });
    return record;
  }

  static parseValue(value, type) {
    if (value === "" || value === null) return null;

    switch (type) {
      case "date":
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      case "decimal":
        const decimal = parseFloat(value);
        return isNaN(decimal) ? null : decimal;
      case "boolean":
        return value === "Yes" || value === true;
      case "number":
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
    if (sampleRecord && typeof sampleRecord === "object") {
      Object.keys(sampleRecord).forEach((key) => {
        // Skip sensitive fields
        if (["password", "id"].includes(key)) {
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
    if (str.includes("_")) {
      // snake_case → Title Case
      titleCase = str
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else {
      // camelCase → Title Case
      titleCase = str
        .replace(/([A-Z])/g, " $1") // Add space before capitals
        .replace(/^./, (char) => char.toUpperCase()) // Capitalize first letter
        .trim();
    }

    return titleCase;
  }

  static camelCaseToTitleCase(str) {
    return this.fieldNameToTitleCase(str);
  }

  static detectType(value) {
    if (value === null || value === undefined) return "string";
    if (value instanceof Date) return "date";
    if (typeof value === "number") {
      return value % 1 === 0 ? "number" : "decimal";
    }
    if (typeof value === "boolean") return "boolean";
    return "string";
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
      ([_, col]) => col.header === excelHeader,
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
