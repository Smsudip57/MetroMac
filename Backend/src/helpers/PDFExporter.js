/**
 * PDFExporter
 * Formats data for PDF generation
 * Similar pattern to ExcelExporter
 */
class PDFExporter {
  /**
   * Format task data for PDF export
   */
  static formatTasksForPDF(tasks) {
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || "N/A",
      status: task.status,
      assigned_to: this.formatUser(task.assignee),
      reporter: this.formatUser(task.reporter),
      start_date: this.formatDate(task.start_date),
      end_date: this.formatDate(task.end_date),
      submission_date: task.submission_date
        ? this.formatDate(task.submission_date)
        : "N/A",
      completion_date: task.completion_date
        ? this.formatDate(task.completion_date)
        : "N/A",
      created_at: this.formatDate(task.created_at),
      updated_at: this.formatDate(task.updated_at),
    }));
  }

  /**
   * Helper: Format user name
   */
  static formatUser(user) {
    if (!user) return "Unassigned";
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username || "Unknown";
  }

  /**
   * Helper: Format customer name
   */
  static formatCustomer(customer) {
    if (!customer) return "N/A";
    return customer.firstName && customer.lastName
      ? `${customer.firstName} ${customer.lastName}`
      : customer.email || "Unknown";
  }

  /**
   * Helper: Format date (YYYY-MM-DD)
   */
  static formatDate(date) {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  }

  /**
   * Helper: Get status color for styling
   */
  static getStatusColor(status) {
    const colors = {
      pending: "#FFA500",
      submitted: "#4169E1",
      in_progress: "#FF69B4",
      on_hold: "#FFB6C1",
      completed: "#32CD32",
      cancelled: "#FF6347",
      active: "#87CEEB",
    };
    return colors[status] || "#808080";
  }

  /**
   * Helper: Get status badge HTML
   */
  static getStatusBadge(status) {
    const color = this.getStatusColor(status);
    return `<span style="
      background-color: ${color};
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    ">${status.toUpperCase()}</span>`;
  }
}

export { PDFExporter };
