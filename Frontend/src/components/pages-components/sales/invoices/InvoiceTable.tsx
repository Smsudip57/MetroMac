"use client";
import React, { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useCurrencyData } from "@/hooks/useCurrencyData";
import { DynamicTable } from "@/components/reuseable/Shared/DynamicTable";
import { toast } from "react-hot-toast";
// import {
//   useGetInvoicesQuery,
//   useDeleteInvoiceMutation,
// } from "@/redux/api/invoice/InvoiceApis";
import ConfirmModal from "@/components/reuseable/Shared/ConfirmModal";
import { formatDate } from "@/lib/utils";
import { TableStatus } from "@/components/shared/table/TableItems";

type InvoiceTableProps = {
  searchTerm: string;
  onEditInvoice?: (invoice: any) => void;
  onRowSelect?: (selectedItems: any[]) => void;
};

export default function InvoiceTable({
  searchTerm,
  onEditInvoice,
  onRowSelect,
}: InvoiceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Get currency data from Redux
  const { formatPrice } = useCurrencyData();

  // API hooks - disabled due to missing API
  // const { data, isLoading } = useGetInvoicesQuery({
  //   page: currentPage,
  //   limit: pageSize,
  //   search: debouncedSearch || undefined,
  //   sortBy: sortConfig?.key,
  //   sortOrder: sortConfig?.direction,
  // });

  const data = { data: [], pagination: { totalCount: 0, totalPages: 0 } };
  const isLoading = false;

  // const [deleteInvoice] = useDeleteInvoiceMutation();

  // Handle sorting
  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Handle delete invoice
  const handleDeleteInvoice = (invoice: any) => {
    setInvoiceToDelete(invoice);
    setShowConfirmModal(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;

    setIsDeleting(true);
    try {
      // await deleteInvoice(invoiceToDelete.id).unwrap();
      toast.success("Invoice deleted successfully");
      setShowConfirmModal(false);
      setInvoiceToDelete(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete invoice");
    } finally {
      setIsDeleting(false);
    }
  };

  // Table columns
  const columns = [
    {
      key: "serial",
      header: "S/L",
      cell: (item: any, index: number) => (
        <span className="font-medium text-[#747382]">
          {(currentPage - 1) * pageSize + index}
        </span>
      ),
      width: 60,
    },
    {
      key: "invoice_number",
      header: "Invoice #",
      sortable: true,
      cell: (item: any) => (
        <span className="font-medium text-primary">{item.invoice_number}</span>
      ),
    },
    {
      key: "total_amount",
      header: "Amount",
      sortable: true,
      cell: (item: any) => {
        // Calculate total from sales items + tax
        const itemsTotal =
          item.sales_items?.reduce(
            (sum: number, salesItem: any) =>
              sum + parseFloat(salesItem.total_price || 0),
            0
          ) || 0;
        const totalWithTax = itemsTotal + parseFloat(item.tax_amount || 0);

        return (
          <span className="font-medium">
            {item.currency} {totalWithTax.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortKey: "status_id",
      cell: (item: any) => (
        <TableStatus
          statusName={item.status?.name || "Draft"}
          backgroundColor={item.status?.background_color}
          textColor={item.status?.text_color}
        />
      ),
    },
    {
      key: "issue_date",
      header: "Issue Date",
      sortable: true,
      cell: (item: any) => <span>{formatDate.getDate(item.issue_date)}</span>,
    },
    {
      key: "due_date",
      header: "Due Date",
      sortable: true,
      cell: (item: any) => {
        const dueDate = new Date(item.due_date);
        const today = new Date();
        const isOverdue =
          dueDate < today && item.status?.name?.toLowerCase() !== "paid";

        return (
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {formatDate.getDate(item.due_date)}
          </span>
        );
      },
    },
    {
      key: "payment_method",
      header: "Payment Method",
      cell: (item: any) => (
        <span className="capitalize">{item.payment_method?.name || "-"}</span>
      ),
    },
  ];

  return (
    <>
      <DynamicTable
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        options={{
          selectable: true, // Enable bulk selection
          actions: {
            edit: true,
            delete: true,
          },
        }}
        onEdit={onEditInvoice}
        onDelete={handleDeleteInvoice}
        onRowSelect={onRowSelect}
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          enabled: true,
          currentPage,
          pageSize,
          totalRecords: data?.pagination?.totalCount || 0,
          totalPages: data?.pagination?.totalPages || 0,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <ConfirmModal
        open={showConfirmModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowConfirmModal(false);
            setInvoiceToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Invoice"
        message={
          <>
            Are you sure you want to delete invoice:{" "}
            <strong>{invoiceToDelete?.invoice_number}</strong>? <br />
            This action cannot be undone.
          </>
        }
        type="warning"
        confirmText="Delete Invoice"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </>
  );
}
