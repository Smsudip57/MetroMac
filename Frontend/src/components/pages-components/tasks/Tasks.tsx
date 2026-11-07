"use client";
import React, { useState, useRef } from "react";
import AddEditTaskModal from "./AddEditTaskModal";
import TasksTable from "./TasksTable";
import FilterTaskModal from "./FilterTaskModal";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
import CustomStatsCard from "@/components/reuseable/Shared/CustomStatsCard";
import SearchField from "@/components/reuseable/Shared/SearchField";
import ImportExport from "@/components/reuseable/ImportExport";
import { useGetTaskStatsQuery } from "@/redux/api/tasks/taskApi";
import { useAppSelector } from "@/lib/hooks";
import UsersIcon from "@/assets/icons/settings/UsersIcon";
import { toast } from "react-hot-toast";

type TasksProps = {
  type?: "archive" | "normal";
};

export default function Tasks({ type = "normal" }: TasksProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [dateFilters, setDateFilters] = useState({
    fromDate: "",
    toDate: "",
    assignedTo: "",
    reporterId: "",
    statuses: [] as string[],
  });
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Get user from Redux
  const { user } = useAppSelector((state) => state.auth);
  const isEmployee = user?.role?.toLowerCase() === "employee";

  // Fetch task statistics data
  const { data: taskStatsResponse } = useGetTaskStatsQuery({});

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setEditingTask(null);
  };

  const handleApplyFilters = (filters: {
    fromDate?: string;
    toDate?: string;
    assignedTo?: string;
    reporterId?: string;
    statuses?: string[];
  }) => {
    setDateFilters({
      fromDate: filters.fromDate || "",
      toDate: filters.toDate || "",
      assignedTo: filters.assignedTo || "",
      reporterId: filters.reporterId || "",
      statuses: filters.statuses || [],
    });
  };

  // Format filters for backend export API
  const formatFiltersForExport = () => {
    const formattedFilters: any = {};

    if (searchTerm) {
      formattedFilters.search = searchTerm;
    }

    if (dateFilters.statuses?.length) {
      formattedFilters.status = dateFilters.statuses.join(",");
    }

    if (dateFilters.fromDate) {
      formattedFilters.fromDate = dateFilters.fromDate;
    }
    if (dateFilters.toDate) {
      formattedFilters.toDate = dateFilters.toDate;
    }
    if (dateFilters.assignedTo) {
      formattedFilters.assigned_to = dateFilters.assignedTo;
    }
    if (dateFilters.reporterId) {
      formattedFilters.reporter_id = dateFilters.reporterId;
    }

    formattedFilters.showArchived = type === "archive" ? "true" : "false";

    return formattedFilters;
  };

  const statsData = taskStatsResponse?.data
    ? [
        {
          label: "Total",
          value: taskStatsResponse.data.totalTasks || 0,
          // percentageChange: taskStatsResponse.data.totalTasksChange || 0,
          bg: "primary",
          showIcon: true as const,
          icon: (
            <ContainerWrapper className="!p-2 !bg-primary/10 rounded-lg max-h-max">
              <UsersIcon className=" text-primary/80 hidden sm+:block" />
              <UsersIcon
                className=" text-primary/80 sm+:hidden !mt-0"
                width={16}
                height={16}
              />
            </ContainerWrapper>
          ),
        },
        {
          label: "Acknowledged",
          value: taskStatsResponse.data.acknowledgedTasks || 0,
          // percentageChange: taskStatsResponse.data.acknowledgedTasksChange || 0,
          bg: "success",
          showPie: true as const,
          total: taskStatsResponse.data.totalTasks || 0,
          // showProgress: true as const,
        },
        {
          label: "Completed",
          value: taskStatsResponse.data.completedTasks || 0,
          // percentageChange: taskStatsResponse.data.completedTasksChange || 0,
          bg: "info",
          showPie: true as const,
          total: taskStatsResponse.data.totalTasks || 0,
          // showProgress: true as const,
        },
        {
          label: "Overdue",
          value: taskStatsResponse.data.overdueTasks || 0,
          // percentageChange: taskStatsResponse.data.overdueTasksChange || 0,
          bg: "warning",
          showPie: true as const,
          total: taskStatsResponse.data.totalTasks || 0,
          // showProgress: true as const,
        },
      ]
    : [];

  return (
    <div className="grid gap-3 sm+:gap-6">
      {!isEmployee && type !== "archive" && (
        <CustomStatsCard data={statsData} />
      )}
      <ContainerWrapper>
        <div
          className="flex flex-col gap-2 sm+:flex-row sm+:items-center sm+:gap-3 mb-4 sm+:mb-6"
          style={type === "archive" ? { marginBottom: 0 } : undefined}
        >
          <SearchField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              type === "archive"
                ? "Search archived tasks..."
                : "Search tasks..."
            }
            className="!block w-full sm+:w-auto sm+:flex-1 sm+:max-w-xs min-w-0"
          />
          <div className="flex items-center gap-1.5 sm+:gap-3 w-full sm+:w-auto sm+:ml-auto justify-start">
            {type !== "archive" && (
              <AddEditTaskModal
                open={editModalOpen}
                setOpen={(open) => {
                  setEditModalOpen(open);
                  if (!open) setEditingTask(null);
                }}
                editingTask={editingTask}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onTaskUpdated={handleModalClose}
                onTaskCreated={handleModalClose}
              />
            )}
            {type !== "archive" && (
              <FilterTaskModal
                onApplyFilters={handleApplyFilters}
                filterButtonRef={filterButtonRef}
                activeCount={
                  (dateFilters.statuses?.length || 0) +
                  (dateFilters.assignedTo ? 1 : 0) +
                  (dateFilters.reporterId ? 1 : 0) +
                  (dateFilters.fromDate || dateFilters.toDate ? 1 : 0)
                }
              />
            )}
            <ImportExport
              module="task"
              filters={formatFiltersForExport()}
              onImportSuccess={() => {
                toast.success("Tasks imported successfully!");
              }}
              onExportSuccess={() => {
                toast.success("Tasks exported successfully!");
              }}
            />
          </div>
        </div>

        <TasksTable
          searchTerm={searchTerm}
          statusFilter={dateFilters.statuses}
          onEditTask={handleEditTask}
          type={type}
          dateFilters={dateFilters}
        />
      </ContainerWrapper>
    </div>
  );
}
