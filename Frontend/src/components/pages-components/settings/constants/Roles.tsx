"use client";
import React, { useState } from "react";
import { DynamicTable } from "@/components/reuseable/Shared/DynamicTable";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "@/redux/api/settings/constants/rolesApi";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
import CustomModal from "@/components/reuseable/Shared/CustomModal";
import { z } from "zod";
import { Plus } from "lucide-react";
import SearchField from "@/components/reuseable/Shared/SearchField";
import { toast } from "react-hot-toast";
import Tab from "../../../reuseable/Shared/CustomTab";
import CommonTab from "./components/CommonTab";
import { TableSingleItem, TableStatus } from "@/components/shared/table/TableItems";

export default function Roles() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);

  // API hooks
  const { data, isLoading } = useGetRolesQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
  });

  const [createRole, { isLoading: isCreatingRole }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  // Table columns
  const columns = [
    {
      key: "serial",
      header: "S/L",
      cell: (item: any, index: number) => (
        <TableSingleItem
          value={(currentPage - 1) * pageSize + index + 1}
          onClick={() => { }}
        />
      ),
      width: 60,
    },
    {
      key: "name",
      header: "Role Name",
      cell: (item: any) => (
        <TableSingleItem
          value={item.name}
          onClick={() => { }}
        />
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (item: any) => (
        <TableStatus
          statusName={item.type}
          backgroundColor="var(--color-primary-light)"
          textColor="var(--color-primary)"
        />
      ),
      width: 100,
    },
    {
      key: "userCount",
      header: "Users Count",
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            {item._count?.users || 0} users
          </span>
        </div>
      ),
      width: 120,
    },
  ];

  // Handle delete role
  const handleDelete = async (item: any) => {
    if (item._count?.users > 0) {
      toast.error(
        `Cannot delete role. ${item._count.users} user(s) are assigned to this role.`
      );
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteRole(item.id).unwrap();
        toast.success("Role deleted successfully");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete role");
      }
    }
  };

  // Handle edit
  const handleEdit = (item: any) => {
    setEditingItem({ ...item });
  };

  return (
    <div className="space-y-6 ">
      <CommonTab />
      <ContainerWrapper>
        {/* Search */}
        <div className="flex items-center justify-between gap-4">
          <CustomModal
            title="Add New Role"
            triggerText={
              <span className="flex items-center gap-1">
                <Plus className="!size-3" /> Add New
              </span>
            }
            formClassName="flex gap-4 min-w-2xl"
            fields={[
              {
                name: "name",
                label: "Role Name",
                type: "text",
                placeholder: "Enter role name",
                required: true,
                disabled: isCreatingRole,
              },
              {
                name: "type",
                label: "Type",
                type: "select",
                placeholder: "Select type...",
                options: [
                  { label: "Internal", value: "internal" },
                  { label: "External", value: "external" },
                ],
                required: true,
                disabled: isCreatingRole,
              },
            ]}
            resolver={z.object({
              name: z.string().min(1, "Role name is required"),
              type: z.enum(["internal", "external"]),
            })}
            onSubmit={async (
              values: { name: string; type: "internal" | "external" },
              methods
            ) => {
              try {
                await createRole({
                  name: values.name.trim(),
                  type: values.type,
                }).unwrap();
                toast.success("Role created successfully");
                if (methods && typeof methods.reset === "function") {
                  methods.reset();
                }
              } catch (error: any) {
                toast.error(error?.data?.message || "Failed to create role");
              }
            }}
            triggerProps={{
              className: "flex items-center gap-2",
              disabled: isCreatingRole,
              size: "sm",
            }}
          />
          <SearchField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles..."
            className="relative flex-1 max-w-sm"
            inputClassName="pl-10"
          />
        </div>

        {/* Edit Role Modal */}
        {editingItem && (
          <CustomModal
            title="Edit Role"
            triggerText={null}
            open={!!editingItem}
            onOpenChange={(open) => {
              if (!open) {
                setEditingItem(null);
              }
            }}
            formClassName="flex gap-4 min-w-2xl"
            fields={[
              {
                name: "name",
                label: "Role Name",
                type: "text",
                placeholder: "Enter role name",
                required: true,
                disabled: isUpdatingRole,
              },
              {
                name: "type",
                label: "Type",
                type: "select",
                placeholder: "Select type...",
                options: [
                  { label: "Internal", value: "internal" },
                  { label: "External", value: "external" },
                ],
                required: true,
                disabled: isUpdatingRole,
              },
            ]}
            resolver={z.object({
              name: z.string().min(1, "Role name is required"),
              type: z.enum(["internal", "external"]),
            })}
            defaultValues={{ name: editingItem.name, type: editingItem.type }}
            onSubmit={async (values) => {
              try {
                await updateRole({
                  id: editingItem.id,
                  name: values.name.trim(),
                  type: values.type,
                }).unwrap();
                toast.success("Role updated successfully");
                setEditingItem(null);
              } catch (error: any) {
                toast.error(error?.data?.message || "Failed to update role");
              }
            }}
            dialogProps={{
              open: true,
              onOpenChange: (open) => {
                if (!open) setEditingItem(null);
              },
            }}
            triggerProps={{ style: { display: "none" } }}
          />
        )}

        {/* Roles Table */}
        <div className="bg-bg rounded-lg  ">
          <DynamicTable
            data={data?.data || []}
            columns={columns}
            isLoading={isLoading}
            options={{
              actions: {
                edit: true,
                delete: true,
              },
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
      </ContainerWrapper>
    </div>
  );
}
