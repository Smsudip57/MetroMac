"use client";
import React, { useState } from "react";
import AddEditTaskModal from "./AddEditTaskModal";
import TasksTable from "./TasksTable";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
import CustomStatsCard from "@/components/reuseable/Shared/CustomStatsCard";
import SearchField from "@/components/reuseable/Shared/SearchField";
import CustomTab from "@/components/reuseable/Shared/CustomTab";
import ImportExport from "@/components/reuseable/ImportExport";
import { useGetTaskStatsQuery } from "@/redux/api/tasks/taskApi";
import UsersIcon from "@/assets/icons/settings/UsersIcon";
import { toast } from "react-hot-toast";

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

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

  const statsData = taskStatsResponse?.data
    ? [
        {
          label: "Total Tasks",
          value: taskStatsResponse.data.totalTasks || 0,
          percentageChange: taskStatsResponse.data.totalTasksChange || 0,
          bg: "primary",
          showIcon: true as const,
          icon: (
            <ContainerWrapper className="!p-2 !bg-primary/10 rounded-lg">
              <UsersIcon className=" text-primary/80" />
            </ContainerWrapper>
          ),
        },
        {
          label: "Active Tasks",
          value: taskStatsResponse.data.activeTasks || 0,
          percentageChange: taskStatsResponse.data.activeTasksChange || 0,
          bg: "success",
          showPie: true as const,
          total: taskStatsResponse.data.totalTasks || 0,
          showProgress: true as const,
        },
        {
          label: "Completed Tasks",
          value: taskStatsResponse.data.completedTasks || 0,
          percentageChange: taskStatsResponse.data.completedTasksChange || 0,
          bg: "info",
          showPie: true as const,
          total: taskStatsResponse.data.totalTasks || 0,
          showProgress: true as const,
        },
        {
          label: "Overdue Tasks",
          value: taskStatsResponse.data.overdueTasks || 0,
          percentageChange: taskStatsResponse.data.overdueTasksChange || 0,
          bg: "warning",
          showPie: true as const,
          total: taskStatsResponse.data.totalTasks || 0,
          showProgress: true as const,
        },
      ]
    : [];

  return (
    <div className="grid gap-6">
      <CustomStatsCard data={statsData} />
      <ContainerWrapper>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <SearchField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="flex-1 max-w-sm"
          />
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
          <div className="w-46 ml-4">
            {/* Import/Export Toolbar */}
            <ImportExport
              module="task"
              onImportSuccess={() => {
                toast.success("Tasks imported successfully!");
              }}
              onExportSuccess={() => {
                toast.success("Tasks exported successfully!");
              }}
            />
          </div>
          </div>
          <CustomTab
            tabs={[
              { key: "all", label: "All Tasks" },
              { key: "pending", label: "Pending" },
              { key: "active", label: "Active" },
              { key: "on_hold", label: "On Hold" },
              { key: "completed", label: "Completed" },
              { key: "cancelled", label: "Cancelled" },
            ]}
            selectedTab={statusFilter}
            setSelectedTab={setStatusFilter}
          />
        </div>

        <TasksTable
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onEditTask={handleEditTask}
        />
      </ContainerWrapper>
    </div>
  );
}
