"use client";
import React, { useEffect, useState } from "react";
import CustomModal from "@/components/reuseable/Shared/CustomModal";
import CustomSideWindow from "@/components/reuseable/Shared/CustomSideWindow";
import { useWindowSize } from "@/hooks/useWindowSize";
import { z } from "zod";
import { toast } from "react-hot-toast";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "@/redux/api/tasks/taskApi";
import { useGetUsersQuery } from "@/redux/api/users/userApi";
import { FormProvider, useForm, Controller } from "react-hook-form";
import FormInputHF from "@/components/reuseable/forms/WithHookForm/FormInputHF";
import SearchSelectHF from "@/components/reuseable/forms/WithHookForm/SearchSelectHF";
import SingleDatePickerHF from "@/components/reuseable/forms/WithHookForm/SingleDatePickerHF";
import { Button } from "@/components/ui/button";
import { Plus, X, Calendar, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

type TaskAlert = {
  id?: number;
  alert_date: string; // Format: ISO UTC string (e.g., 2025-12-24T10:00:00Z or 2025-12-24T10:00:00)
};

type AddEditTaskModalProps = {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  editingTask?: any | null;
  onTaskCreated?: () => void;
  onTaskUpdated?: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

export default function AddEditTaskModal({
  searchTerm,
  setSearchTerm,
  editingTask = null,
  onTaskCreated,
  onTaskUpdated,
  open,
  setOpen,
}: AddEditTaskModalProps) {
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  // Alerts state management
  const [alerts, setAlerts] = useState<TaskAlert[]>([]);
  const [alertFrequency, setAlertFrequency] = useState<number>(0);
  const [alertMode, setAlertMode] = useState<"manual" | "auto">("manual");

  // Separate form for alert
  const alertFormMethods = useForm({
    defaultValues: {
      alert_date: "",
      alert_frequency: 0,
    },
  });

  // Auto-update alert frequency in manual mode
  React.useEffect(() => {
    if (alertMode === "manual") {
      alertFormMethods.setValue("alert_frequency", alerts.length);
    }
  }, [alerts.length, alertFormMethods, alertMode]);

  // Zod schema for validation
  const schema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    hold_reason: z.string().optional(),
    alert_frequency: z
      .number()
      .min(0, "Alert frequency must be at least 0")
      .optional(),
    reporter_id: z.number().min(1, "Employer is required"),
    assigned_to: z.number().optional().nullable(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  });

  const getDefaultValues = (editingTask: any) =>
    editingTask
      ? {
          title: editingTask.title || "",
          description: editingTask.description || "",
          status: {
            value: editingTask.status || "pending",
            label: editingTask.status
              ? editingTask.status.charAt(0).toUpperCase() +
                editingTask.status.slice(1).replace(/_/g, " ")
              : "Pending",
          },
          hold_reason: editingTask.hold_reason || "",
          alert_frequency: 0,
          // Set reporter_id from editing task
          reporter_id:
            editingTask.reporter_id && editingTask.reporter
              ? {
                  value: editingTask.reporter_id.toString(),
                  label: `${editingTask.reporter.firstName} ${editingTask.reporter.lastName}`,
                }
              : null,
          // Only set assigned_to if there's an actual assignee (not null)
          assigned_to:
            editingTask.assigned_to && editingTask.assignee
              ? {
                  value: editingTask.assigned_to.toString(),
                  label: `${editingTask.assignee.firstName} ${editingTask.assignee.lastName}`,
                }
              : null,
          start_date: editingTask.start_date
            ? new Date(editingTask.start_date).toISOString().split("T")[0]
            : "",
          end_date: editingTask.end_date
            ? new Date(editingTask.end_date).toISOString().split("T")[0]
            : "",
        }
      : {
          title: "",
          description: "",
          status: { value: "pending", label: "Pending" },
          hold_reason: "",
          alert_frequency: 0,
          reporter_id: null,
          assigned_to: null,
          start_date: "",
          end_date: "",
        };

  const methods = useForm({
    resolver: async (data) => {
      try {
        // Extract values from select fields
        const mappedData = {
          title: data.title,
          description: data.description,
          status: data.status?.value || data.status, // Handle both string and object
          hold_reason: data.hold_reason, // Include hold_reason
          reporter_id: data.reporter_id?.value
            ? parseInt(data.reporter_id.value)
            : null,
          assigned_to: data.assigned_to?.value
            ? parseInt(data.assigned_to.value)
            : null,
          start_date: data.start_date,
          end_date: data.end_date,
        };
        return {
          values: schema.parse(mappedData),
          errors: {},
        };
      } catch (e: any) {
        console.log("ZOD ERROR", e);
        return {
          values: {},
          errors: e.formErrors?.fieldErrors || {},
        };
      }
    },
    defaultValues: getDefaultValues(editingTask),
  });

  // Get the current status value
  const statusValue = methods.watch("status");
  const currentStatus =
    typeof statusValue === "object" ? statusValue?.value : statusValue;
  const formAlertFrequency = methods.watch("alert_frequency") || 0;

  // Reset form values when editingTask changes
  useEffect(() => {
    methods.reset(getDefaultValues(editingTask));
    // Pre-fill alerts when editing - NORMALIZE TO UTC ISO STRINGS
    if (editingTask?.taskAlerts && Array.isArray(editingTask.taskAlerts)) {
      const convertedAlerts = editingTask.taskAlerts.map((alert: any) => ({
        id: alert?.id,
        // Normalize backend response to proper UTC ISO string
        // If backend returns "2025-12-24T04:00:00" (no Z), convert to proper UTC ISO
        alert_date: alert?.alert_date
          ? new Date(alert.alert_date).toISOString()
          : "",
      }));
      setAlerts(convertedAlerts);
    } else {
      setAlerts([]);
    }
    setAlertFrequency(0);
    setAlertMode("manual"); // Reset to manual mode when editing
    // Reset alert form
    alertFormMethods.reset({ alert_date: "", alert_frequency: 0 });
  }, [editingTask, methods, alertFormMethods]);

  // Also reset search term when modal closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open, setSearchTerm]);

  const onSubmit = async (values: any) => {
    try {
      // Validate start_date is before end_date for alerts
      const startDate = new Date(values.start_date);
      if (alerts.length > 0) {
        for (const alert of alerts) {
          const alertDate = new Date(alert.alert_date);
          if (alertDate < startDate) {
            toast.error(
              `Alert date must be equal to or after task start date (${values.start_date})`
            );
            return;
          }
        }
      }

      // Validate alert frequency
      if (formAlertFrequency > 0 && formAlertFrequency < alerts.length) {
        toast.error(
          `Alert frequency (${formAlertFrequency}) must be equal to or greater than number of alerts (${alerts.length})`
        );
        return;
      }

      // Values are already processed by resolver - no need to extract again
      if (editingTask) {
        await updateTask?.({
          id: editingTask.id,
          title: values.title.trim(),
          description: values.description,
          status: values.status,
          hold_reason: values.hold_reason || undefined,
          reporter_id: values.reporter_id,
          assigned_to: values.assigned_to,
          start_date: values.start_date,
          end_date: values.end_date,
          taskAlerts: alerts.map((alert) => ({
            alert_date: alert.alert_date,
          })),
          alertFrequency:
            formAlertFrequency > 0 ? formAlertFrequency : undefined,
        })?.unwrap?.();
        toast.success("Task updated successfully");
        if (onTaskUpdated) onTaskUpdated();
      } else {
        await createTask?.({
          title: values.title.trim(),
          description: values.description,
          status: values.status,
          hold_reason: values.hold_reason || undefined,
          reporter_id: values.reporter_id,
          assigned_to: values.assigned_to,
          start_date: values.start_date,
          end_date: values.end_date,
          taskAlerts: alerts.map((alert) => ({
            alert_date: alert.alert_date,
          })),
          alertFrequency:
            formAlertFrequency > 0 ? formAlertFrequency : undefined,
        })?.unwrap?.();
        toast.success("Task created successfully");
        if (onTaskCreated) onTaskCreated();
      }
      methods.reset();
      setAlerts([]);
      if (setOpen) setOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit task");
    }
  };

  // Mock data for dropdowns - replace with actual API calls if needed
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Handle adding a new alert
  const handleAddAlert = () => {
    const alertDate = alertFormMethods.getValues("alert_date");

    if (!alertDate || !alertDate.trim()) {
      toast.error("Alert date & time is required");
      return;
    }

    // Get start_date from form values
    const formStartDate = methods.getValues("start_date");
    if (!formStartDate) {
      toast.error("Please set task start date first");
      return;
    }

    // Validate using Date objects (alertDate is already in UTC format from DatePicker)
    const alertDateTime = new Date(alertDate);
    const startDate = new Date(formStartDate);

    if (alertDateTime < startDate) {
      toast.error(
        `Alert date & time must be equal to or after task start date`
      );
      return;
    }

    // Check if alert date already exists (exact string match for UTC)
    if (alerts.some((alert) => alert.alert_date === alertDate)) {
      toast.error("This alert date & time already exists");
      return;
    }

    // Add the alert with the exact UTC string from date picker (don't re-parse!)
    setAlerts([...alerts, { alert_date: alertDate }]);
    alertFormMethods.resetField("alert_date");
    toast.success("Alert added successfully");
  };

  // Handle removing an alert from the table
  const handleRemoveAlert = (index: number) => {
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  // Handle auto-generating alerts by frequency
  const handleAutoGenerateAlerts = () => {
    const frequency = alertFormMethods.getValues("alert_frequency") || 0;

    if (!frequency || frequency <= 0) {
      toast.error("Please enter a valid frequency number");
      return;
    }

    // Get start and end dates
    const startDateVal = methods.getValues("start_date");
    const endDateVal = methods.getValues("end_date");

    if (!startDateVal || !endDateVal) {
      toast.error("Please set task start and end dates first");
      return;
    }

    // Clear existing alerts and set frequency - backend will generate them
    setAlerts([]);
    setAlertFrequency(frequency);
    alertFormMethods.resetField("alert_frequency");
    toast.success(`Ready to generate ${frequency} alerts when task is saved`);
    setAlertMode("manual"); // Switch back to manual mode
  };

  const isLoading = editingTask ? isUpdating : isCreating;
  const { width } = useWindowSize();
  const isMobile = width < 1024; // lg breakpoint

  const FormComponent = () => {
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full pl-6">
          <div className="mb-2">
            <h3 className="text-2xl font-bold mb-1 tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h3>
            <p className="text-body-2 text-text_highlight">
              {editingTask
                ? "Update the details for this task."
                : "Fill in the details to create a new task."}
            </p>
          </div>
          <div className={` flex flex-col gap-4 ${isMobile?"!max-h-[calc(100vh-185px)]":"!max-h-[calc(80vh-160px)]"} overflow-y-auto pr-6 pt-4`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <FormInputHF
                  name="title"
                  label="Task Title"
                  placeholder="Enter task title"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="md:col-span-3">
                <FormInputHF
                  name="description"
                  label="Description"
                  type="textarea"
                  placeholder="Enter task description"
                  disabled={isLoading}
                />
              </div>

              <SingleDatePickerHF
                name="start_date"
                label="Start Date"
                placeholder="Select start date"
                required
                disabled={isLoading}
              />
              <SingleDatePickerHF
                name="end_date"
                label="End Date"
                placeholder="Select end date"
                required
                disabled={isLoading}
              />
              <SearchSelectHF
                name="status"
                label="Status"
                options={statusOptions}
                required
                disabled={isLoading}
                searchable
                placeholder="Select status"
              />
              <SearchSelectHF
                name="reporter_id"
                label="Employer"
                required
                disabled={isLoading}
                searchable
                placeholder="Search and select employer"
                onScrollLoadMore={true}
                rtkQueryHook={useGetUsersQuery}
                mapOption={(user: any) => ({
                  value: user.id.toString(),
                  label: `${user.firstName} ${user.lastName}`,
                })}
                defaultParams={{ limit: 100 }}
              />
              <SearchSelectHF
                name="assigned_to"
                label="Assigned To"
                disabled={isLoading}
                searchable
                placeholder="Search and select assignee"
                onScrollLoadMore={true}
                rtkQueryHook={useGetUsersQuery}
                mapOption={(user: any) => ({
                  value: user.id.toString(),
                  label: `${user.firstName} ${user.lastName}`,
                })}
                defaultParams={{ limit: 100 }}
              />

              {/* Show hold reason textarea when status is "on_hold" */}
              {currentStatus === "on_hold" && (
                <div className="md:col-span-3">
                  <FormInputHF
                    name="hold_reason"
                    label="Hold Reason"
                    type="textarea"
                    placeholder="Enter reason for holding this task"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            {/* Alerts Section - Chip-based approach with inline picker */}
            <div className="rounded-lg bg-bg">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-primary" />
                <h3 className="text-base font-semibold text-text">
                  Task Alerts
                </h3>
              </div>

              {/* Alert Chips/Badges */}
              {alerts.length > 0 && (
                <div
                  className="max-h-28 overflow-y-auto flex flex-wrap gap-2 mb-4 pb-4 pr-2 pt-1 relative"
                  style={{
                    boxShadow:
                      "inset 0 -8px 8px -4px rgba(0, 0, 0, 0.05), inset 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-full text-small text-text hover:bg-primary/15 transition-colors"
                    >
                      <Calendar size={14} className="text-primary" />
                      <span className="font-medium">
                        {formatDate.getDateAndTime(alert.alert_date)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAlert(index)}
                        className="ml-1 p-0.5 hover:bg-warning/20 rounded-full transition-colors"
                        title="Remove alert"
                      >
                        <X size={14} className="text-warning" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Mode Toggle Tabs */}
              <div className="mb-4">
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
              <FormProvider {...alertFormMethods}>
                {alertMode === "manual" ? (
                  // Manual Mode: Date picker + Add button
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <SingleDatePickerHF
                        name="alert_date"
                        label="Add Alert Date & Time"
                        placeholder="Pick date and time"
                        withTime={true}
                      />
                    </div>

                    {/* Add Button */}
                    <Button type="button" onClick={handleAddAlert} size="sm">
                      Add
                    </Button>
                  </div>
                ) : (
                  // Auto-Generate Mode: Frequency input + Generate button
                  <div className="space-y-3">
                    <div className="w-full">
                      <FormInputHF
                        name="alert_frequency"
                        label="Number of Alerts to Generate"
                        type="number"
                        placeholder="e.g., 5"
                        disabled={isLoading}
                        min={1}
                      />
                    </div>
                  </div>
                )}
              </FormProvider>
            </div>
          </div>
          <div className="flex justify-end items-center mt-8 pr-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  {editingTask ? "Updating..." : "Creating..."}
                </span>
              ) : editingTask ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    );
  };

  return (
    <div>
      {/* Mobile: Add Task Button + CustomSideWindow (width < 1024px) */}
      {isMobile ? (
        <>
          <Button
            onClick={() => setOpen?.(true)}
            className="flex items-center gap-2"
            size="sm"
          >
            Add Task
          </Button>
          <CustomSideWindow open={open || false} onOpenChange={setOpen || (() => {})} className="!px-0" initialWidth={width} maxWidth={width}>
            <FormComponent />
          </CustomSideWindow>
        </>
      ) : (
        /* Desktop: CustomModal (width >= 1024px) */
        <CustomModal
          contentClassName="min-w-[1000px] !gap-0"
          triggerText={<span className="flex items-center gap-1">Add Task</span>}
          resolver={schema}
          onSubmit={() => {}}
          open={open}
          onOpenChange={setOpen}
          form={<FormComponent />}
          triggerProps={{
            className: "flex items-center gap-2",
            disabled: isLoading,
            size: "sm",
          }}
        />
      )}
    </div>
  );
}
