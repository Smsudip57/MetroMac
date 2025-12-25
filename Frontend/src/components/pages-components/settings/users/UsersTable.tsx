"use client";
import React, { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { DynamicTable } from "@/components/reuseable/Shared/DynamicTable";
import { TableDoubleHoriZontalItemsWithImage } from "@/components/shared/table/TableItems";
import ConfirmModal from "@/components/reuseable/Shared/ConfirmModal";
import { toast } from "react-hot-toast";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "@/redux/api/users/userApi";

type UsersTableProps = {
  searchTerm: string;
  onEditUser?: (user: any) => void;
  type?: string;
};

export default function UsersTable({
  searchTerm,
  onEditUser,
  type,
}: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 400);

  // API hooks

  const { data, isLoading } =
    useGetUsersQuery?.({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch || undefined,
      ...(type && { type }),
    }) || {};

  const [deleteUser] = useDeleteUserMutation?.() || [];

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
      key: "fullName",
      header: "Full Name",
      cell: (item: any) => (
        <TableDoubleHoriZontalItemsWithImage
          img={item.profileImage}
          title={
            [item.firstName, item.lastName].filter(Boolean).join(" ") || "-"
          }
          subtitle={item.username}
        />
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (item: any) => <span>{item.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      cell: (item: any) => <span>{item.role?.name || "-"}</span>,
    },
    ...(type === "external"
      ? [
          {
            key: "company_name",
            header: "Company Name",
            cell: (item: any) => <span>{item.company_name || "-"}</span>,
          },
        ]
      : []),
    ...(type === "external"
      ? [
          {
            key: "company_address",
            header: "Company Address",
            cell: (item: any) => <span>{item.company_address || "-"}</span>,
          },
        ]
      : []),
    {
      key: "status",
      header: "Status",
      cell: (item: any) => {
        // Active if verified and not suspended
        const isActive = item.is_verified && !item.is_suspended;
        return (
          <span
            className={
              `px-2 py-1 rounded-full text-xs font-semibold ` +
              (isActive
                ? "bg-green-100 text-success"
                : "bg-yellow-100 text-warning")
            }
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
      width: 100,
    },
  ];

  // Handle delete user
  const handleDelete = async (item: any) => {
    setUserToDelete(item);
    setShowConfirmModal(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await deleteUser?.(userToDelete.id)?.unwrap?.();
      toast.success("User deleted successfully");
      setShowConfirmModal(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit
  const handleEdit = (item: any) => {
    if (typeof onEditUser === "function") {
      onEditUser({ ...item });
    }
  };

  return (
    <>
      <div className="space-y-6 !mt-4 sm+:!mt-6">
        <div className="space-y-6  ">
          {/* Users Table */}
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
        </div>
      </div>

      <ConfirmModal
        open={showConfirmModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowConfirmModal(false);
            setUserToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={
          <>
            Are you sure you want to delete user:{" "}
            <strong>{userToDelete?.username}</strong>? <br />
            This action cannot be undone.
          </>
        }
        type="warning"
        confirmText="Delete User"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </>
  );
}
