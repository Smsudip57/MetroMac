import React from "react";
import Checkbox from "@/components/reuseable/forms/Checkbox";

type PermissionNode = {
  id: number;
  name: string;
  permissions: { id: number; action: string }[];
  children: PermissionNode[];
};

interface PermissionsTreeProps {
  tree: PermissionNode[];
  checked: Record<number, string[]>;
  onCheck: (moduleId: number, perm: string) => void;
  childrenAvailable?: boolean;
  isLoading?: boolean;
  isRoot?: boolean;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  allChecked?: boolean;
  anyChecked?: boolean;
  disabled?: boolean;
}

function getPermissionColor(action: string) {
  const a = action.toLowerCase();
  if (["create", "add", "new"].some((k) => a.includes(k)))
    return "text-green-600";
  if (["read", "view", "list", "get"].some((k) => a.includes(k)))
    return "text-blue-600";
  if (["update", "edit", "patch"].some((k) => a.includes(k)))
    return "text-yellow-600";
  if (["delete", "remove", "destroy"].some((k) => a.includes(k)))
    return "text-red-600";
  return "text-gray-600";
}

const PermissionsTree: React.FC<PermissionsTreeProps> = ({
  tree,
  checked,
  onCheck,
  childrenAvailable = false,
  isLoading = false,
  isRoot = true,
  onSelectAll,
  onClearAll,
  allChecked,
  anyChecked,
  disabled = false,
}) => (
  <ul className="space-y-2 relative">
    {isRoot && (
      <div className="mb-2 sticky top-4 z-10">
        <div className="absolute flex items-center justify-end gap-3 right-4">
          {!allChecked && (
            <span
              className="text-xs text-primary cursor-pointer hover:underline "
            onClick={disabled ? undefined : onSelectAll}
          >
            Select All
          </span>
        )}
        {anyChecked && (
          <span
          className="text-xs text-gray-500 cursor-pointer hover:underline ml-2"
          onClick={disabled ? undefined : onClearAll}
          >
            Clear
          </span>
        )}
        </div>
      </div>
    )}
    {tree.map((mod, idx) => (
      <li key={mod.id} className="relative">
        {childrenAvailable && (
          <span
            className="absolute left-[-20px] top-1 -rotate-[50deg]"
            style={{ width: 18, height: 32, display: "block" }}
          >
            <svg width="18" height="32" style={{ display: "block" }}>
              <path
                d="M18 0 Q0 16 18 32"
                stroke="#e5e7eb"
                fill="none"
                strokeWidth="2"
              />
            </svg>
          </span>
        )}
        <div
          className="thread-node group"
          style={{
            // borderRadius: 12,
            background: "white",
            padding: "12px 16px",
            marginBottom: 4,
            // boxShadow: "0 1px 4px #e5e7eb",
            transition: "background 0.2s",
          }}
        >
          <div className="font-semibold mb-1 text-sm">{mod.name}</div>
          <div className="flex flex-wrap gap-2 mb-1">
            {mod.permissions.map((perm) => (
              <Checkbox
                key={perm.id}
                label={perm.action}
                isChecked={checked[mod.id]?.includes(perm.action) || false}
                onToggle={disabled ? () => {} : () => onCheck(mod.id, perm.action)}
                labelClassName={`text-sm ${getPermissionColor(perm.action)}`}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
        {mod.children && mod.children.length > 0 ? (
          <div className="thread-children ml-6 pl-4 border-l-2 border-gray-200 relative">
            <div className="">
              <PermissionsTree
                tree={mod.children}
                checked={checked}
                onCheck={onCheck}
                childrenAvailable={mod.children.length > 0 ? true : false}
                isLoading={isLoading}
                isRoot={false}
              />
            </div>
          </div>
        ) : (
          <div
            className={`thread-children ml-6 pl-4 border-l-2 border-gray-200 relative h-5 -mt-1.5 -mb-3 ${
              idx === tree.length - 1 ? "invisible" : ""
            }`}
          ></div>
        )}
        <style jsx>{`
          .thread-node:hover {
            background: #f3f4f6;
          }
          .thread-children {
            position: relative;
          }
        `}</style>
      </li>
    ))}
  </ul>
);

export default PermissionsTree;
