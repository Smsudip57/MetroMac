"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/lib/utils";
import { DynamicTable } from "@/components/reuseable/Shared/DynamicTable";
import {
  TableDoubleHoriZontalItemsWithImage,
  TableSingleItem,
  TableStatus,
} from "@/components/shared/table/TableItems";
import ConfirmModal from "@/components/reuseable/Shared/ConfirmModal";
import { toast } from "react-hot-toast";
import {
  useGetTasksQuery,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskAlertMutation,
} from "@/redux/api/tasks/taskApi";
import { ControlledPopover } from "@/components/ui/popover";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
import { X } from "lucide-react";
import { Archive } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import FormInputHF from "@/components/reuseable/forms/WithHookForm/FormInputHF";
import SingleDatePickerHF from "@/components/reuseable/forms/WithHookForm/SingleDatePickerHF";
import { Button } from "@/components/ui/button";

type TasksTableProps = {
  searchTerm: string;
  statusFilter?: string;
  onEditTask?: (task: any) => void;
  type?: "archive" | "normal"; // 'archive' for archive mode, 'normal' for delete mode
};

export default function TasksTable({
  searchTerm,
  statusFilter,
  onEditTask,
  type = "normal",
}: TasksTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [taskToArchive, setTaskToArchive] = useState<any>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [alertsPopupOpen, setAlertsPopupOpen] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<any[]>([]);
  const [alertsButtonElement, setAlertsButtonElement] =
    useState<HTMLButtonElement | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [alertMode, setAlertMode] = useState<"manual" | "auto">("manual");

  // Alert form for popup
  const alertFormMethods = useForm({
    defaultValues: {
      alert_date: "",
      alert_frequency: 0,
    },
  });

  // Auto-update alert frequency to match alert count
  React.useEffect(() => {
    if (alertMode === "manual") {
      alertFormMethods.setValue("alert_frequency", selectedAlerts.length);
    }
  }, [selectedAlerts.length, alertFormMethods, alertMode]);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // API hooks
  const { data, isLoading } =
    useGetTasksQuery?.({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch || undefined,
      status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
      sortBy: sortConfig?.key,
      sortOrder: sortConfig?.direction,
      showArchived: type === "archive" ? "true" : undefined,
    }) || {};

  const [deleteTask] = useDeleteTaskMutation?.() || [];
  const [updateTask] = useUpdateTaskMutation?.() || [];
  const [deleteTaskAlert] = useDeleteTaskAlertMutation?.() || [];

  // Handle sorting
  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
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
      key: "title",
      header: "Task Title",
      sortable: true,
      cell: (item: any) => (
        <TableSingleItem
          className="inline-block !min-w-28"
          value={item.title}
          onClick={() => handleView(item)}
        />
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (item: any) => (
        <TableSingleItem
          value={item.description || "-"}
          onClick={() => {}}
          className="!line-clamp-2 inline-block !max-w-64"
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (item: any) => {
        const statusLabel =
          item.status?.charAt(0).toUpperCase() +
          item.status?.slice(1).replace(/_/g, " ");
        return <TableStatus statusName={statusLabel || "-"} />;
      },
      width: 120,
    },
    {
      key: "assignee",
      header: "Assigned To",
      cell: (item: any) => (
        <TableDoubleHoriZontalItemsWithImage
          img={item.assignee?.profileImage}
          title={
            item.assignee
              ? `${item.assignee.firstName} ${item.assignee.lastName}`
              : "-"
          }
          className="min-w-max"
          subtitle={item.assignee?.username || ""}
        />
      ),
    },
    {
      key: "reporter",
      header: "Assigned By",
      cell: (item: any) => (
        <TableDoubleHoriZontalItemsWithImage
          img={item.reporter?.profileImage}
          title={
            item.reporter
              ? `${item.reporter.firstName} ${item.reporter.lastName}`
              : "-"
          }
          className="min-w-max"
          subtitle={item.reporter?.username || ""}
        />
      ),
    },
    {
      key: "start_date",
      header: "Start Date",
      sortable: true,
      cell: (item: any) => {
        const startDate = item.start_date
          ? formatDate.getDate(item.start_date)
          : "-";
        return <span className="text-sm">{startDate}</span>;
      },
      width: 120,
    },
    {
      key: "end_date",
      header: "End Date",
      sortable: true,
      cell: (item: any) => {
        const endDate = item.end_date ? formatDate.getDate(item.end_date) : "-";
        return <span className="text-sm">{endDate}</span>;
      },
      width: 120,
    },
    {
      key: "taskAlerts",
      header: "Alerts",
      cell: (item: any) => {
        const alertCount = item.taskAlerts?.length || 0;
        return (
          <button
            onClick={(e) => {
              setAlertsButtonElement(e.currentTarget);
              setSelectedAlerts(item.taskAlerts || []);
              setSelectedTaskId(item.id);
              setAlertMode("manual"); // Reset to manual mode when opening
              alertFormMethods.setValue("alert_frequency", alertCount);
              alertFormMethods.resetField("alert_date");
              setAlertsPopupOpen(true);
            }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-full transition-colors ${
              alertCount > 0
                ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/15"
                : "bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200"
            }`}
          >
            {alertCount > 0 && (
              <span className="text-xs font-semibold">{alertCount}</span>
            )}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        );
      },
      width: 120,
    },
  ];

  // Handle delete task
  const handleDelete = async (item: any) => {
    if (type === "archive") {
      // Archive mode - show delete confirmation
      setTaskToDelete(item);
      setShowConfirmModal(true);
    } else {
      // Normal mode - show archive confirmation
      setTaskToArchive(item);
      setShowArchiveModal(true);
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTask?.(taskToDelete.id)?.unwrap?.();
      toast.success("Task deleted successfully");
      setShowConfirmModal(false);
      setTaskToDelete(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm archive handler
  const handleConfirmArchive = async () => {
    if (!taskToArchive) return;

    setIsArchiving(true);
    try {
      await updateTask?.({
        id: taskToArchive.id,
        is_archived: true,
      })?.unwrap?.();
      toast.success("Task archived successfully");
      setShowArchiveModal(false);
      setTaskToArchive(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to archive task");
    } finally {
      setIsArchiving(false);
    }
  };

  // Handle edit
  const handleEdit = (item: any) => {
    if (typeof onEditTask === "function") {
      onEditTask({ ...item });
    }
  };

  // Handle view
  const handleView = (item: any) => {
    router.push(`/tasks/view?id=${item.id}`);
  };

  // Handle removing an alert from popup
  const handleRemoveAlert = async (index: number) => {
    const alertToDelete = selectedAlerts[index];

    if (!alertToDelete?.id) {
      // If alert doesn't have an ID yet (newly added), just remove from UI
      setSelectedAlerts(selectedAlerts.filter((_, i) => i !== index));
      toast.success("Alert removed");
      return;
    }

    try {
      // Call API to delete the alert
      await deleteTaskAlert?.(alertToDelete.id)?.unwrap?.();
      setSelectedAlerts(selectedAlerts.filter((_, i) => i !== index));
      toast.success("Alert deleted successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete alert");
    }
  };

  // Handle adding alert from popup
  const handleAddAlertFromPopup = async () => {
    const alertDate = alertFormMethods.getValues("alert_date");
    const alertFrequency = alertFormMethods.getValues("alert_frequency") || 0;

    if (!alertDate || !alertDate.trim()) {
      toast.error("Alert date & time is required");
      return;
    }

    // Check if alert date already exists
    if (selectedAlerts.some((alert) => alert.alert_date === alertDate)) {
      toast.error("This alert date & time already exists");
      return;
    }

    setIsAddingAlert(true);
    try {
      const updatedAlerts = [...selectedAlerts, { alert_date: alertDate }];

      const taskToUpdate = data?.data?.find(
        (t: any) => t.id === selectedTaskId
      );
      if (!taskToUpdate) {
        toast.error("Task not found");
        return;
      }

      await updateTask?.({
        id: selectedTaskId,
        title: taskToUpdate.title,
        description: taskToUpdate.description,
        status: taskToUpdate.status,
        assigned_to: taskToUpdate.assigned_to,
        start_date: taskToUpdate.start_date,
        end_date: taskToUpdate.end_date,
        taskAlerts: updatedAlerts.map((alert) => ({
          alert_date: alert.alert_date,
        })),
        alertFrequency: alertFrequency > 0 ? alertFrequency : undefined,
      })?.unwrap?.();

      setSelectedAlerts(updatedAlerts);
      alertFormMethods.resetField("alert_date");
      toast.success("Alert added successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add alert");
    } finally {
      setIsAddingAlert(false);
    }
  };

  // Handle auto-generating alerts by frequency
  const handleAutoGenerateAlerts = async () => {
    const alertFrequency = alertFormMethods.getValues("alert_frequency") || 0;

    if (!alertFrequency || alertFrequency <= 0) {
      toast.error("Please enter a valid frequency number");
      return;
    }

    setIsAddingAlert(true);
    try {
      const taskToUpdate = data?.data?.find(
        (t: any) => t.id === selectedTaskId
      );
      if (!taskToUpdate) {
        toast.error("Task not found");
        return;
      }

      // Send update with frequency but no manual alerts (auto-generate mode)
      await updateTask?.({
        id: selectedTaskId,
        title: taskToUpdate.title,
        description: taskToUpdate.description,
        status: taskToUpdate.status,
        assigned_to: taskToUpdate.assigned_to,
        start_date: taskToUpdate.start_date,
        end_date: taskToUpdate.end_date,
        taskAlerts: [], // Empty array - system will auto-generate all
        alertFrequency: alertFrequency,
      })?.unwrap?.();

      // Refresh alerts from server
      toast.success(`Successfully generated ${alertFrequency} alerts`);
      alertFormMethods.resetField("alert_frequency");

      // Optionally refetch or close popup
      setAlertsPopupOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to generate alerts");
    } finally {
      setIsAddingAlert(false);
    }
  };

  return (
    <>
      <div className={`space-y-6 ${type === "archive" ? "!mt-0 sm+:!mt-0 xl:!mt-6" : "!mt-4 sm+:!mt-6" }`}>
        <div className="space-y-6">
          {/* Tasks Table */}
          <div className="bg-bg rounded-lg">
            <DynamicTable
              data={data?.data || []}
              columns={columns}
              isLoading={isLoading}
              showColumnDividers={true}
              options={{
                actions: {
                  view: true,
                  edit: type !== "archive",
                  delete: true,
                },
              }}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              sortConfig={sortConfig}
              onSort={handleSort}
              icons={
                type === "archive"
                  ? undefined
                  : {
                      delete: <Archive size={16} />,
                    }
              }
              pagination={{
                enabled: true,
                currentPage,
                pageSize,
                totalRecords: data?.pagination?.totalCount || 0,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
                pageSizeOptions: [5, 10, 20, 50],
              }}
            />
          </div>
        </div>
      </div>

      {/* Alerts Popup - Improved UI/UX */}
      {alertsButtonElement && (
        <ControlledPopover
          open={alertsPopupOpen}
          onOpenChange={setAlertsPopupOpen}
          anchorRef={{ current: alertsButtonElement }}
          placement="bottom-right"
          className="!p-0 !z-[50] w-max"
        >
          <ContainerWrapper
            className="!p-0 w-[340px] shadow-primary flex flex-col"
            style={{ boxShadow: "0 10px 30px #6157ff24", overflow: "visible" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text">
                    Task Alerts
                  </h3>
                  <p className="text-xs text-text_highlight mt-0.5">
                    {selectedAlerts.length}{" "}
                    {selectedAlerts.length === 1 ? "alert" : "alerts"}
                  </p>
                </div>
              </div>
            </div>

            {/* Alerts List - Scrollable */}
            <div
              className="flex-1 overflow-y-auto px-2 !my-2"
              style={{
                maxHeight: "240px",
                boxShadow:
                  "inset 0 2px 4px -2px rgba(0, 0, 0, 0.05), inset 0 -2px 4px -2px rgba(0, 0, 0, 0.05)",
              }}
            >
              {selectedAlerts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedAlerts.map((alert: any, index: number) => (
                    <div
                      key={index}
                      className="group inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-full text-small text-text hover:bg-primary/15 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-primary flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                      <span className="font-medium">
                        {formatDate.getDateAndTime(alert.alert_date)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAlert(index)}
                        className="ml-1 p-0.5 opacity-0 group-hover:opacity-100 hover:bg-warning/20 rounded-full transition-all duration-200"
                        title="Remove alert"
                      >
                        <X size={14} className="text-warning" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-text_highlight">
                    No alerts yet
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Add alerts to be notified
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border flex-shrink-0 !mt-0"></div>

            {/* Mode Toggle Tabs */}
            <div className="px-4 pt-3 pb-0 bg-gray-50/50 flex-shrink-0 !mt-0">
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setAlertMode("manual")}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors ${
                    alertMode === "manual"
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  Manual Add
                </button>
                <button
                  type="button"
                  onClick={() => setAlertMode("auto")}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors ${
                    alertMode === "auto"
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  Auto-Generate
                </button>
              </div>
            </div>
            {/* Conditional Form based on Mode */}
            <div className="px-4 py-3 pt-0 bg-gray-50/50 flex-shrink-0 !mt-0">
              <FormProvider {...alertFormMethods}>
                {alertMode === "manual" ? (
                  // Manual Mode: Date picker only
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <SingleDatePickerHF
                        name="alert_date"
                        label="Add Alert"
                        placeholder="Select"
                        withTime={true}
                        labelClassName="mb-2"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddAlertFromPopup}
                      size="sm"
                      disabled={isAddingAlert}
                      className="flex-shrink-0 rounded-2xl"
                    >
                      {isAddingAlert ? "Adding..." : "Add"}
                    </Button>
                  </div>
                ) : (
                  // Auto-Generate Mode: Only frequency input
                  <div className="space-y-3">
                    <div className="w-full">
                      <FormInputHF
                        name="alert_frequency"
                        label="Number of Alerts to Generate"
                        type="number"
                        placeholder="e.g., 5"
                        className="mt-0"
                        min={0}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAutoGenerateAlerts}
                      disabled={isAddingAlert}
                      className="w-full rounded-2xl"
                      size="sm"
                    >
                      {isAddingAlert ? "Generating..." : "Generate Alerts"}
                    </Button>
                  </div>
                )}
              </FormProvider>
            </div>
          </ContainerWrapper>
        </ControlledPopover>
      )}

      <ConfirmModal
        open={showConfirmModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowConfirmModal(false);
            setTaskToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={
          <>
            Are you sure you want to delete task:{" "}
            <strong>{taskToDelete?.title}</strong>? <br />
            This action cannot be undone.
          </>
        }
        type="warning"
        confirmText="Delete Task"
        cancelText="Cancel"
        isLoading={isDeleting}
      />

      <ConfirmModal
        open={showArchiveModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowArchiveModal(false);
            setTaskToArchive(null);
          }
        }}
        onConfirm={handleConfirmArchive}
        title="Archive Task"
        message={
          <>
            Are you sure you want to archive task:{" "}
            <strong>{taskToArchive?.title}</strong>? <br />
            Archived tasks will be moved out of your active task list.
          </>
        }
        type="warning"
        confirmText="Archive Task"
        cancelText="Cancel"
        isLoading={isArchiving}
      />
    </>
  );
}
