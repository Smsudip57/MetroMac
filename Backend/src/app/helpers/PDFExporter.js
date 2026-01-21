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
      status: this.formatStatus(task.status),
      assigned_to: this.formatUser(task.assignee),
      reporter: this.formatUser(task.reporter),
      start_date: this.formatDate(task.start_date),
      end_date: this.formatDate(task.end_date),
      priority: task.priority || "Normal",
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
   * Format invoice data for PDF export
   */
  static formatInvoicesForPDF(invoices) {
    return invoices.map((invoice) => ({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      customer: this.formatCustomer(invoice.quotation?.customer),
      issue_date: this.formatDate(invoice.issue_date),
      due_date: this.formatDate(invoice.due_date),
      total_amount: this.formatCurrency(invoice.total_amount),
      status: invoice.status?.name || "Unknown",
      payment_method: invoice.payment_method?.name || "N/A",
      quotation_number: invoice.quotation?.quotation_number || "N/A",
      notes: invoice.notes || "N/A",
      created_at: this.formatDate(invoice.created_at),
    }));
  }

  /**
   * Format quotation data for PDF export
   */
  static formatQuotationsForPDF(quotations) {
    return quotations.map((quotation) => ({
      id: quotation.id,
      quotation_number: quotation.quotation_number,
      customer: this.formatCustomer(quotation.customer),
      issue_date: this.formatDate(quotation.issue_date),
      validity_date: this.formatDate(quotation.validity_date),
      total_amount: this.formatCurrency(quotation.total_amount),
      status: quotation.status?.name || "Unknown",
      notes: quotation.notes || "N/A",
      created_at: this.formatDate(quotation.created_at),
    }));
  }

  /**
   * Format lead data for PDF export
   */
  static formatLeadsForPDF(leads) {
    return leads.map((lead) => ({
      id: lead.id,
      title: lead.title,
      name: `${lead.first_name} ${lead.last_name}`,
      email: lead.email || "N/A",
      phone: lead.phone || "N/A",
      status: lead.status?.name || "Unknown",
      source: lead.source?.name || "Unknown",
      company: lead.company || "N/A",
      notes: lead.notes || "N/A",
      created_at: this.formatDate(lead.created_at),
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
   * Helper: Format currency
   */
  static formatCurrency(amount) {
    if (!amount) return "$0.00";
    return `$${parseFloat(amount).toFixed(2)}`;
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
