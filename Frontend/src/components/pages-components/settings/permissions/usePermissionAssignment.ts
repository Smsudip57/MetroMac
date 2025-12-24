import { useEffect, useState, useMemo } from "react";
import {
  useSetRolePermissionsMutation,
  useBulkSetRolePermissionsMutation,
  useGetRolePermissionsQuery,
  useSetUserPermissionsMutation,
  useBulkSetUserPermissionsMutation,
} from "@/redux/api/profile/permissonApi";
import { useGetUserPermissionsQuery } from "@/redux/api/users/userApi";
import { useGetAllPermissionsQuery } from "@/redux/api/profile/permissonApi";
import toast from "react-hot-toast";

export function usePermissionAssignment(tab: string, selected: number[]) {
  const [checked, setChecked] = useState<Record<number, string[]>>({});
  const { data: permissionsData } = useGetAllPermissionsQuery({});
  const permissionsTree = useMemo(
    () => permissionsData?.data || [],
    [permissionsData]
  );

  // Single entity IDs
  const singleRoleId =
    tab === "role" && selected.length === 1 ? selected[0] : null;
  const singleUserId =
    tab === "user" && selected.length === 1 ? selected[0] : null;

  // API hooks
  const { data: rolePermsData, isFetching: isRoleLoading } =
    useGetRolePermissionsQuery(singleRoleId!, {
      skip: !singleRoleId,
    });
  const { data: userPermsData, isFetching: isUserLoading } =
    useGetUserPermissionsQuery(singleUserId!, {
      skip: !singleUserId,
    });
  const [setRolePermissions] = useSetRolePermissionsMutation();
  const [bulkSetRolePermissions] = useBulkSetRolePermissionsMutation();
  const [setUserPermissions] = useSetUserPermissionsMutation();
  const [bulkSetUserPermissions] = useBulkSetUserPermissionsMutation();

  // Sync checked state to backend
  useEffect(() => {
    // Helper to walk the permission tree and collect checked actions by module id
    const checkedMap: Record<number, string[]> = {};
    function walkTreeFromTree(tree: any[]) {
      tree.forEach((mod) => {
        if (mod.permissions?.length) {
          checkedMap[mod.id] = mod.permissions.map((p: any) => p.action);
        }
        if (mod.children?.length) walkTreeFromTree(mod.children);
      });
    }

    if (selected.length !== 1) {
    }
    if (
      tab === "role" &&
      selected.length === 1 &&
      Array.isArray(rolePermsData?.data) &&
      rolePermsData.data.length > 0 &&
      typeof rolePermsData.data[0] === "object" &&
      rolePermsData.data[0].permissions !== undefined
    ) {
      walkTreeFromTree(rolePermsData.data);
      setChecked(checkedMap);
    } else if (
      tab === "user" &&
      selected.length === 1 &&
      Array.isArray(userPermsData?.data) &&
      userPermsData.data.length > 0 &&
      typeof userPermsData.data[0] === "object" &&
      userPermsData.data[0].permissions !== undefined
    ) {
      walkTreeFromTree(userPermsData.data);
      setChecked(checkedMap);
    } else {
      setChecked({});
    }
  }, [
    tab,
    selected,
    rolePermsData,
    userPermsData,
    permissionsTree,
  ]);

  function handleCheck(moduleId: number, perm: string) {
    setChecked((prev) => {
      const perms = prev[moduleId] || [];
      return {
        ...prev,
        [moduleId]: perms.includes(perm)
          ? perms.filter((p) => p !== perm)
          : [...perms, perm],
      };
    });
  }

  async function handleSave() {
    if (selected.length === 0) return;
    const getPermissionIds = () => {
      const ids: number[] = [];
      permissionsTree.forEach((mod: any) => {
        if (checked[mod.id]) {
          mod.permissions.forEach((p: any) => {
            if (checked[mod.id].includes(p.action)) ids.push(p.id);
          });
        }
        if (mod.children?.length) {
          mod.children.forEach((child: any) => {
            if (checked[child.id]) {
              child.permissions.forEach((p: any) => {
                if (checked[child.id].includes(p.action)) ids.push(p.id);
              });
            }
          });
        }
      });
      return ids;
    };
    const permissionIds = getPermissionIds();
    try {
      if (tab === "role") {
        if (selected.length === 1) {
          const res = await setRolePermissions({
            id: selected[0],
            permissions: permissionIds,
          }).unwrap();
          if (res?.success) toast.success("Permissions updated for role");
          else toast.error(res?.message || "Failed to update permissions");
        } else {
          const res = await bulkSetRolePermissions(
            selected.map((id) => ({ id, permissions: permissionIds }))
          ).unwrap();
          if (res?.success)
            toast.success("Bulk permissions updated for roles");
          else toast.error(res?.message || "Failed to update permissions");
        }
      } else if (tab === "user") {
        if (selected.length === 1) {
          const res = await setUserPermissions({
            id: selected[0],
            permissions: permissionIds,
          }).unwrap();
          if (res?.success) toast.success("Permissions updated for user");
          else toast.error(res?.message || "Failed to update permissions");
        } else {
          const res = await bulkSetUserPermissions(
            selected.map((id) => ({ id, permissions: permissionIds }))
          ).unwrap();
          if (res?.success) toast.success("Bulk permissions updated for users");
          else toast.error(res?.message || "Failed to update permissions");
        }
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to update permissions"
      );
    }
  }

  // Determine loading state for single selection
  let permissionLoading = false;
  if (tab === "role" && selected.length === 1)
    permissionLoading = isRoleLoading;
  if (tab === "user" && selected.length === 1)
    permissionLoading = isUserLoading;

  return {
    permissionsTree,
    checked,
    setChecked,
    handleCheck,
    handleSave,
    permissionLoading,
  };
}
