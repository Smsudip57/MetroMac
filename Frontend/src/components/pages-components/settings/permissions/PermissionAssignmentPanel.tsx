import React from "react";
import PermissionsTree from "./PermissionsTree";
import { Button } from "@/components/ui/button";

interface PermissionAssignmentPanelProps {
  tab: string;
  selected: number[];
  entities: any[];
  permissionsTree: any[];
  checked: Record<number, string[]>;
  setChecked: React.Dispatch<React.SetStateAction<Record<number, string[]>>>;
  handleCheck: (moduleId: number, perm: string) => void;
  handleSave: () => void;
  permissionLoading?: boolean;
}

const PermissionAssignmentPanel: React.FC<PermissionAssignmentPanelProps> = ({
  tab,
  selected,
  entities,
  permissionsTree,
  checked,
  setChecked,
  handleCheck,
  handleSave,
  permissionLoading,
}) => {
  // Helper to flatten all permission actions in the tree
  function getAllPermissionActions(tree: any[]): [number, string][] {
    let perms: [number, string][] = [];
    tree.forEach((mod) => {
      if (mod.permissions?.length) {
        perms = perms.concat(
          mod.permissions.map((p: any) => [mod.id, p.action])
        );
      }
      if (mod.children?.length) {
        perms = perms.concat(getAllPermissionActions(mod.children));
      }
    });
    return perms;
  }

  const allPerms = getAllPermissionActions(permissionsTree);
  const totalPerms = allPerms.length;
  const checkedCount = allPerms.filter(([modId, action]) =>
    checked[modId]?.includes(action)
  ).length;
  const allChecked = totalPerms > 0 && checkedCount === totalPerms;
  const anyChecked = checkedCount > 0;

  const disabled = selected.length === 0;

  return (
    <div className="flex-1">
      <div className="mb-4 flex items-center gap-2 text-sm">
        {selected.length > 1 ? (
          <span className="font-medium text-primary">
            Bulk assign permissions to {selected.length} {tab}s
          </span>
        ) : selected.length === 1 ? (
          <span className="font-medium text-primary">
            Assign permissions to:{" "}
            {tab === "user"
              ? (() => {
                  const u = entities.find((e: any) => e.id === selected[0]);
                  return (
                    u?.username ||
                    u?.email ||
                    `${u?.firstName || ""} ${u?.lastName || ""}`.trim() ||
                    `User #${u?.id}`
                  );
                })()
              : entities.find((e: any) => e.id === selected[0])?.name}
          </span>
        ) : (
          <span className="text-gray-400">
            Select a {tab} to assign permissions
          </span>
        )}
      </div>
      <div className="border rounded-lg p-4 bg-bg_shade ">
        <div className="bg-white rounded-lg overflow-y-auto max-h-[580px]">
          <PermissionsTree
            isRoot={true}
            tree={permissionsTree}
            checked={checked}
            onCheck={disabled ? () => {} : handleCheck}
            isLoading={permissionLoading}
            allChecked={allChecked}
            anyChecked={anyChecked}
            onSelectAll={
              disabled
                ? undefined
                : () =>
                    setChecked(
                      getAllPermissionActions(permissionsTree).reduce(
                        (acc, [modId, action]) => {
                          if (!acc[modId]) acc[modId] = [];
                          acc[modId].push(action);
                          return acc;
                        },
                        {} as Record<number, string[]>
                      )
                    )
            }
            onClearAll={disabled ? undefined : () => setChecked({})}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2 justify-end mr-5">
        <Button disabled={selected.length === 0} onClick={handleSave} size="sm">
          Update
        </Button>
      </div>
    </div>
  );
};

export default PermissionAssignmentPanel;
