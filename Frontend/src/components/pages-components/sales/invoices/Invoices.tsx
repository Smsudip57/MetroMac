// "use client";
// import React, { useState } from "react";
// import AddEditInvoiceModal from "./AddEditInvoiceModal";
// import InvoiceTable from "./InvoiceTable";
// import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
// import CustomStatsCard from "@/components/reuseable/Shared/CustomStatsCard";
// import SearchField from "@/components/reuseable/Shared/SearchField";
// import ImportExport from "@/components/reuseable/ImportExport";
// import {
//   useGetInvoiceStatsQuery,
//   useBulkDeleteInvoicesMutation,
// } from "@/redux/api/invoice/InvoiceApis";
// import WalletIcon from "@/assets/icons/shared/WalletIcon";
// import TableButton from "@/components/reuseable/buttons/TableButton";
// import ConfirmModal from "@/components/reuseable/Shared/ConfirmModal";
// import { toast } from "react-hot-toast";

// export default function Invoices() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [editingInvoice, setEditingInvoice] = useState<any>(null);
//   const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
//   const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

//   // Fetch invoice statistics data
//   const { data: invoiceStatsResponse } = useGetInvoiceStatsQuery({});

//   // Bulk delete hook
//   const [bulkDeleteInvoices, { isLoading: isDeleting }] =
//     useBulkDeleteInvoicesMutation();

//   const handleEditInvoice = (invoice: any) => {
//     setEditingInvoice(invoice);
//     setEditModalOpen(true);
//   };

//   const handleCreateNewInvoice = () => {
//     setEditingInvoice(null);
//     setEditModalOpen(true);
//   };

//   const handleModalClose = () => {
//     setEditModalOpen(false);
//     setEditingInvoice(null);
//   };

//   // Handle bulk delete - show confirmation modal
//   const handleBulkDeleteClick = () => {
//     if (selectedInvoices.length === 0) return;
//     setShowBulkDeleteConfirm(true);
//   };

//   // Confirm bulk delete
//   const confirmBulkDelete = async () => {
//     const selectedIds = selectedInvoices.map((invoice) => invoice.id);

//     try {
//       const result = await bulkDeleteInvoices(selectedIds).unwrap();
//       toast.success(
//         `Successfully deleted ${result.data.deleted_count} invoice(s)`
//       );
//       setSelectedInvoices([]); // Clear selection
//       setShowBulkDeleteConfirm(false); // Close modal
//     } catch (error: any) {
//       toast.error(error?.data?.message || "Failed to delete invoices");
//     }
//   };

//   // Handle row selection
//   const handleRowSelection = (selectedItems: any[]) => {
//     setSelectedInvoices(selectedItems);
//   };

//   // Transform backend stats data to CustomStatsCard format - Revenue-focused approach with meaningful colors
//   const statsData = invoiceStatsResponse?.data
//     ? [
//         {
//           label: "Total Revenue",
//           value: Math.round(invoiceStatsResponse.data.amounts?.total || 0),
//           percentageChange: 0, // You can add month-over-month growth calculation
//           bg: "secondary", // Purple - Premium/Total Revenue (most important metric)
//           showIcon: true as const,
//           icon: (
//             <ContainerWrapper className="!p-2 !bg-secondary/10 rounded-lg">
//               <WalletIcon className=" text-secondary/80" />
//             </ContainerWrapper>
//           ),
//           showGraphLine: true,
//           graphData: invoiceStatsResponse.data.trends?.totalRevenue || [],
//         },
//         {
//           label: "Revenue Collected",
//           value: Math.round(invoiceStatsResponse.data.amounts?.paid || 0),
//           percentageChange: Math.round(
//             ((invoiceStatsResponse.data.amounts?.paid || 0) /
//               (invoiceStatsResponse.data.amounts?.total || 1)) *
//               100
//           ),
//           bg: "success", // Green - Positive/Success (money received)
//           showPie: true as const,
//           total: Math.round(invoiceStatsResponse.data.amounts?.total || 0),
//           showGraphLine: true,
//           graphData: invoiceStatsResponse.data.trends?.paidRevenue || [],
//         },
//         {
//           label: "Outstanding Amount",
//           value: Math.round(invoiceStatsResponse.data.amounts?.pending || 0),
//           percentageChange: Math.round(
//             ((invoiceStatsResponse.data.amounts?.pending || 0) /
//               (invoiceStatsResponse.data.amounts?.total || 1)) *
//               100
//           ),
//           bg: "neutral", // Orange - Neutral/Pending (attention needed but not urgent)
//           showPie: true as const,
//           total: Math.round(invoiceStatsResponse.data.amounts?.total || 0),
//           showGraphLine: true,
//           graphData: invoiceStatsResponse.data.trends?.pendingRevenue || [],
//         },
//         {
//           label: "Overdue Amount",
//           value: Math.round(invoiceStatsResponse.data.amounts?.overdue || 0),
//           percentageChange: Math.round(
//             ((invoiceStatsResponse.data.amounts?.overdue || 0) /
//               (invoiceStatsResponse.data.amounts?.total || 1)) *
//               100
//           ),
//           bg: "warning", // Red - Warning/Alert (urgent attention needed)
//           showPie: true as const,
//           total: Math.round(invoiceStatsResponse.data.amounts?.total || 0),
//           showGraphLine: true,
//           graphData: invoiceStatsResponse.data.trends?.overdueRevenue || [],
//         },
//       ]
//     : [
//         { loading: true as const, bg: "secondary" },
//         { loading: true as const, bg: "success" },
//         { loading: true as const, bg: "neutral" },
//         { loading: true as const, bg: "warning" },
//       ];

//   return (
//     <div className="grid gap-6">
//       <CustomStatsCard data={statsData} />
//       <ContainerWrapper>
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-4">
//             <TableButton
//               type="add"
//               onClick={handleCreateNewInvoice}
//               buttonText="Invoice"
//               className="flex items-center gap-2"
//             />
//             {selectedInvoices.length > 0 && (
//               <TableButton
//                 type="delete"
//                 onClick={handleBulkDeleteClick}
//                 buttonText={`${selectedInvoices.length} Invoice(s)`}
//                 className="flex items-center gap-2"
//                 isLoading={isDeleting}
//               />
//             )}
//             {/* Import/Export Toolbar */}
//             <div className="">
//               <ImportExport
//                 module="invoice"
//                 onImportSuccess={() => {
//                   toast.success("Invoices imported successfully!");
//                 }}
//                 onExportSuccess={() => {
//                   toast.success("Invoices exported successfully!");
//                 }}
//               />
//             </div>
//           </div>
//           <SearchField
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search invoices..."
//           />
//         </div>

//         <InvoiceTable
//           searchTerm={searchTerm}
//           onEditInvoice={handleEditInvoice}
//           onRowSelect={handleRowSelection}
//         />
//       </ContainerWrapper>

//       {/* AddEditInvoiceModal - Side Window */}
//       <AddEditInvoiceModal
//         open={editModalOpen}
//         setOpen={(open) => {
//           setEditModalOpen(open);
//           if (!open) setEditingInvoice(null);
//         }}
//         editingInvoice={editingInvoice}
//         onInvoiceUpdated={handleModalClose}
//         onInvoiceCreated={handleModalClose}
//       />

//       {/* Bulk Delete Confirmation Modal */}
//       <ConfirmModal
//         open={showBulkDeleteConfirm}
//         onOpenChange={setShowBulkDeleteConfirm}
//         type="warning"
//         title="Delete Invoices"
//         message={<>Are you sure you want to delete <strong>{selectedInvoices?.length}</strong> invoice(s)? <br/>This action cannot be undone.</>}
//         confirmText="Delete"
//         onConfirm={confirmBulkDelete}
//         isLoading={isDeleting}
//       />
//     </div>
//   );
// }

import React from "react";

export default function Invoices() {
  return <div></div>;
}
