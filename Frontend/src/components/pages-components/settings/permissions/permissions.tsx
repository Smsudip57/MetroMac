"use client";
import React, { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import CustomTab from "@/components/reuseable/Shared/CustomTab";
import { useGetRolesQuery } from "@/redux/api/settings/constants/rolesApi";
import { useGetUsersQuery } from "@/redux/api/users/userApi";
import EntityList from "./EntityList";
import PermissionAssignmentPanel from "./PermissionAssignmentPanel";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
import { usePermissionAssignment } from "./usePermissionAssignment";

export default function Permissions() {
  const [tab, setTab] = useState("role");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const debouncedSearch = useDebounce(search, 400);

  // Fetch entities by tab
  const { data: rolesData } = useGetRolesQuery({
    limit: 100,
    search: tab === "role" ? debouncedSearch : undefined,
  });
  const { data: usersData } = useGetUsersQuery({
    limit: 100,
    search: tab === "user" ? debouncedSearch : undefined,
  });
  const entities = React.useMemo(() => {
    if (tab === "role") return rolesData?.data || [];
    return usersData?.data || [];
  }, [tab, rolesData, usersData]);

  // Permission assignment logic
  const {
    permissionsTree,
    checked,
    setChecked,
    handleCheck,
    handleSave,
    permissionLoading,
  } = usePermissionAssignment(tab, selected);

  // Clear state on tab change
  React.useEffect(() => {
    setSelected([]);
    setChecked({});
    setSearch("");
  }, [tab, setChecked]);

  function handleSelect(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  return (
    <ContainerWrapper>
      <div>
        {/* Tabs */}
        <div className="mb-4">
          <CustomTab
            tabs={[
              { key: "role", label: "Role" },
              { key: "user", label: "User" },
            ]}
            selectedTab={tab}
            setSelectedTab={setTab}
          />
        </div>

        <div className="flex gap-6">
          {/* Entity List */}
          <EntityList
            entities={entities}
            tab={tab}
            search={search}
            setSearch={setSearch}
            selected={selected}
            setSelected={setSelected}
            handleSelect={handleSelect}
          />

          {/* Details & Permissions */}
          <PermissionAssignmentPanel
            tab={tab}
            selected={selected}
            entities={entities}
            permissionsTree={permissionsTree}
            checked={checked}
            setChecked={setChecked}
            handleCheck={handleCheck}
            handleSave={handleSave}
            permissionLoading={permissionLoading}
          />
        </div>
      </div>
    </ContainerWrapper>
  );
}
