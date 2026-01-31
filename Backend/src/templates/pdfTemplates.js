/**
 * PDF Templates
 * HTML templates for PDF generation
 */

class PDFTemplates {
  /**
   * Base HTML template wrapper
   */
  static baseTemplate(title, content) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            background: white;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
          }
          
          .header h1 {
            font-size: 22px;
            margin-bottom: 8px;
          }
          
          .header p {
            font-size: 12px;
            opacity: 0.9;
          }
          
          .content {
            padding: 15px;
          }
          
          .footer {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #666;
            text-align: center;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          thead {
            background-color: #f5f5f5;
          }
          
          th {
            padding: 8px 10px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #667eea;
            color: #333;
            font-size: 12px;
          }
          
          td {
            padding: 7px 10px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
          }
          
          tr:hover {
            background-color: #f9f9f9;
          }
          
          .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: white;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .badge-pending { background-color: #FFA500; }
          .badge-submitted { background-color: #4169E1; }
          .badge-acknowledged { background-color: #FF69B4; }
          .badge-on_hold { background-color: #FFB6C1; }
          .badge-rework { background-color: #FF8C00; }
          .badge-completed { background-color: #32CD32; }
          .badge-cancelled { background-color: #FF6347; }
          
          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin: 15px 0;
          }
          
          .summary-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
          }
          
          .summary-box .number {
            font-size: 18px;
            font-weight: bold;
          }
          
          .summary-box .label {
            font-size: 11px;
            opacity: 0.9;
            margin-top: 3px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="footer">
          <p>This is an auto-generated report. Please do not modify manually.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Task Report Template
   */
  static taskReport(tasks, summary = {}) {
    const tableRows = tasks
      .map(
        (task) => `
      <tr>
        <td>${task.title}</td>
        <td>${task.assigned_to}</td>
        <td>
          <span class="status badge-${task.status.toLowerCase()}">${task.status
          }</span>
        </td>
        <td>${task.start_date}</td>
        <td>${task.end_date}</td>
        <td>${task.created_date}</td>
        <td>${task.submission_date}</td>
        <td>${task.completion_date}</td>
      </tr>
    `,
      )
      .join("");

    const content = `
      <h2>Task Report</h2>
      ${summary.total ? this.renderSummaryBoxes(summary) : ""}
      
      <table>
        <thead>
          <tr>
            <th>Task Title</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Created Date</th>
            <th>Submitted Date</th>
            <th>Completed Date</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows ||
      '<tr><td colspan="8" class="text-center">No tasks found</td></tr>'
      }
        </tbody>
      </table>
    `;

    return this.baseTemplate("Task Report", content);
  }

  /**
   * Render summary boxes
   */
  static renderSummaryBoxes(summary) {
    if (!summary.total) return "";

    return `
      <div class="summary">
        <div class="summary-box">
          <div class="number">${summary.total}</div>
          <div class="label">Total Records</div>
        </div>
        <div class="summary-box">
          <div class="number">${summary.pending || 0}</div>
          <div class="label">Pending</div>
        </div>
        <div class="summary-box">
          <div class="number">${summary.acknowledged || 0}</div>
          <div class="label">Acknowledged</div>
        </div>
        <div class="summary-box">
          <div class="number">${summary.completed || 0}</div>
          <div class="label">Completed</div>
        </div>
      </div>
    `;
  }

  /**
   * Calculate summary statistics
   */
  static calculateSummary(records, type = "task") {
    const summary = { total: records.length };

    if (type === "task") {
      summary.completed = records.filter(
        (r) => r.status === "completed",
      ).length;
      summary.pending = records.filter((r) => r.status === "pending").length;
      summary.acknowledged = records.filter(
        (r) => r.status === "acknowledged",
      ).length;
    }

    return summary;
  }
}

export { PDFTemplates };
