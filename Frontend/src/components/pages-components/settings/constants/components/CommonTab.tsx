import React from "react";
import Tab from "@/components/reuseable/Shared/CustomTab";

export default function CommonTab() {
  return (
    <Tab
      tabs={[
        {
          key: "roles",
          label: "Roles",
          path: "/settings/constants/roles",
        },
      ]}
    />
  );
}
