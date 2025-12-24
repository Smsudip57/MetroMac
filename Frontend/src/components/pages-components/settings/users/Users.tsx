"use client";
import React, { useState } from "react";
import AddEditUserModal from "./AddEditUserModal";
import UsersTable from "./UsersTable";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
import CustomStatsCard from "@/components/reuseable/Shared/CustomStatsCard";
import { useGetUserStatsQuery } from "@/redux/api/users/userApi";
import UsersIcon from "@/assets/icons/settings/UsersIcon";

export default function Users({ type }: { type?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Fetch user statistics data
  const { data: userStatsResponse } = useGetUserStatsQuery(
    type ? { type } : {}
  );

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setEditingUser(null);
  };

  // Transform backend stats data to CustomStatsCard format
  const getUserTypeLabel = () => {
    if (type === "external") return "Customers";
    if (type === "internal") return "Staff";
    return "Users";
  };

  const userTypeLabel = getUserTypeLabel();

  const statsData = userStatsResponse?.data
    ? [
        {
          label: `Total ${userTypeLabel}`,
          value: userStatsResponse.data.totalUsers || 0,
          percentageChange: userStatsResponse.data.totalUsersChange || 0,
          bg: "primary",
          showIcon: true as const,
          icon: (
            <ContainerWrapper className="!p-2 !bg-primary/10 rounded-lg">
              <UsersIcon className=" text-primary/80" />
            </ContainerWrapper>
          ),
        },
        {
          label: `Active ${userTypeLabel}`,
          value: userStatsResponse.data.activeUsers || 0,
          percentageChange: userStatsResponse.data.activeUsersChange || 0,
          bg: "success",
          showPie: true as const,
          total: userStatsResponse.data.totalUsers || 0,
          showProgress: true as const,
        },
        {
          label: `Suspended ${userTypeLabel}`,
          value: userStatsResponse.data.suspendedUsers || 0,
          percentageChange: userStatsResponse.data.suspendedUsersChange || 0,
          bg: "warning",
          showPie: true as const,
          total: userStatsResponse.data.totalUsers || 0,
          showProgress: true as const,
        },
        {
          label: `Unverified ${userTypeLabel}`,
          value: userStatsResponse.data.unverifiedUsers || 0,
          percentageChange: userStatsResponse.data.unverifiedUsersChange || 0,
          bg: "neutral",
          showPie: true as const,
          total: userStatsResponse.data.totalUsers || 0,
          showProgress: true as const,
        },
      ]
    : [];

  // console.log(editingUser);
  return (
    <div className="grid gap-6">
      <CustomStatsCard data={statsData} />
      <ContainerWrapper>
        <AddEditUserModal
          open={editModalOpen}
          setOpen={(open) => {
            setEditModalOpen(open);
            if (!open) setEditingUser(null);
          }}
          editingUser={editingUser}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onUserUpdated={handleModalClose}
          onUserCreated={handleModalClose}
        />
        <UsersTable
          searchTerm={searchTerm}
          onEditUser={handleEditUser}
          type={type}
        />
      </ContainerWrapper>
    </div>
  );
}
