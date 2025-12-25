import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import FormSelect from "../forms/WithoutHookForm/FormSelect";

type TabItem = {
  key: string;
  label: string;
  path?: string;
};

type WithPathProps = {
  tabs: TabItem[];
  selectedTab?: never;
  setSelectedTab?: never;
};

type WithoutPathProps = {
  tabs: TabItem[];
  selectedTab: string;
  setSelectedTab: (key: string) => void;
};

type ConstantPageTabProps = WithPathProps | WithoutPathProps;

export default function ConstantPageTab(props: ConstantPageTabProps) {
  const { tabs } = props;
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Always call hooks at the top
  const pathname = usePathname();
  const router = useRouter();
  const allHavePath = tabs?.every((tab) => !!tab.path);

  // Update indicator position on mount and when selected tab changes
  useEffect(() => {
    const getActiveKey = () => {
      if (allHavePath) {
        return tabs.find((tab) => {
          if (!tab.path) return false;
          return pathname === tab.path || pathname.endsWith(tab.key);
        })?.key;
      } else {
        const { selectedTab } = props as WithoutPathProps;
        return selectedTab;
      }
    };

    const activeKey = getActiveKey();
    const activeButton = tabRefs.current[activeKey!];

    if (activeButton) {
      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [allHavePath, pathname, props]);

  if (allHavePath) {
    const active = (tab: TabItem) => {
      if (!tab.path) return false;
      return pathname === tab.path || pathname.endsWith(tab.key);
    };

    const activeKey = tabs.find((tab) => {
      if (!tab.path) return false;
      return pathname === tab.path || pathname.endsWith(tab.key);
    })?.key;

    const handleSelectChange = (value: string) => {
      const selectedTab = tabs.find((tab) => tab.key === value);
      if (selectedTab?.path) {
        router.push(selectedTab.path);
      }
    };

    return (
      <>
        {/* Mobile Selector (below 575px) */}
        <div className="sm+:hidden w-full">
          <FormSelect
            label=""
            options={tabs.map((tab) => ({
              value: tab.key,
              label: tab.label,
            }))}
            value={activeKey}
            onChange={handleSelectChange}
            placeholder="Select tab"
            triggerClassName="h-[36px] !text-xs px-3 py-4 rounded-lg"
            optionsClassName="!text-xs"
          />
        </div>

        {/* Desktop Tabs (575px and above) */}
        <div className="hidden sm+:block w-full relative bg-bg_shade rounded-full h-9 flex gap-0">
          {/* Sliding background indicator */}
          {indicatorStyle && (
            <div
              className="absolute bg-primary rounded-full transition-all duration-300"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                top: "0px",
                bottom: "0px",
              }}
            />
          )}

          {/* Tabs */}
          <div className="relative flex gap-0 w-full h-full">
            {tabs.map((tab) => (
              <button
                ref={(el) => {
                  if (el) tabRefs.current[tab.key] = el;
                }}
                key={tab.key}
                className={`relative flex-1 px-4 rounded-full text-xs font-semibold transition-colors duration-300 focus:outline-none h-full flex items-center justify-center ${
                  active(tab)
                    ? "text-bg"
                    : "text-text hover:text-text_highlight"
                }`}
                onClick={() => router.push(tab.path!)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  } else {
    // Controlled mode: selectedTab/setSelectedTab must be present
    const { selectedTab, setSelectedTab } = props as WithoutPathProps;

    return (
      <>
        {/* Mobile Selector (below 575px) */}
        <div className="sm+:hidden w-full">
          <FormSelect
            label=""
            options={tabs.map((tab) => ({
              value: tab.key,
              label: tab.label,
            }))}
            value={selectedTab}
            onChange={setSelectedTab}
            placeholder="Select tab"
            triggerClassName="h-[36px] !text-xs px-3 py-4 rounded-lg"
            optionsClassName="!text-xs"
          />
        </div>

        {/* Desktop Tabs (575px and above) */}
        <div className="hidden relative bg-bg_shade rounded-full h-9 sm+:flex gap-0">
          {/* Sliding background indicator */}
          {indicatorStyle && (
            <div
              className="absolute bg-primary rounded-full transition-all duration-300"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                top: "0px",
                bottom: "0px",
              }}
            />
          )}

          {/* Tabs */}
          <div className="relative flex gap-0 w-full h-full">
            {tabs?.map((tab) => (
              <button
                ref={(el) => {
                  if (el) tabRefs.current[tab.key] = el;
                }}
                key={tab.key}
                className={`relative flex-1 px-4 rounded-full text-xs font-semibold transition-colors duration-300 focus:outline-none h-full flex items-center justify-center text-nowrap ${
                  selectedTab === tab.key
                    ? "text-bg"
                    : "text-text hover:text-text_highlight"
                }`}
                onClick={() => setSelectedTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }
}
