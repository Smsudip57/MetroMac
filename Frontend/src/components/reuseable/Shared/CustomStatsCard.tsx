import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";
import { getColors } from "@/components/reuseable/colorMapping";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
// Pie size variants
const PIE_SIZES = {
  sm: { width: 28, height: 28, innerRadius: 10, outerRadius: 14 },
  md: { width: 36, height: 36, innerRadius: 14, outerRadius: 18 },
  lg: { width: 49, height: 49, innerRadius: 18, outerRadius: 24 },
};

// Base type for a single stat card
interface BaseStatCardItem {
  label: string;
  value: number;
  percentageChange?: number;
  bg?: string;
}

// Graph data point type
interface GraphDataPoint {
  date: string;
  value: number;
}

// Conditional types for different configurations
type StatCardWithPieOrProgress = BaseStatCardItem & {
  showPie?: true;
  showProgress?: true;
  total: number; // Required when showPie or showProgress is true
  showIcon?: boolean;
  icon?: React.ReactNode;
  showGraphLine?: false;
  graphData?: never;
};

type StatCardWithGraphLine = BaseStatCardItem & {
  showGraphLine: true;
  graphData: GraphDataPoint[]; // Required when showGraphLine is true
  showPie?: boolean;
  showIcon?: boolean;
  icon?: React.ReactNode;
  showProgress?: boolean; // Can show both progress and graph line
  total?: number;
};

type StatCardWithIcon = BaseStatCardItem & {
  showIcon: true;
  icon: React.ReactNode; // Required when showIcon is true
  showPie?: boolean;
  showProgress?: boolean;
  showGraphLine?: boolean;
  graphData?: GraphDataPoint[];
  total?: number;
};

type StatCardBasic = BaseStatCardItem & {
  showPie?: boolean;
  showProgress?: boolean;
  showIcon?: boolean;
  showGraphLine?: boolean;
  total?: number;
  icon?: React.ReactNode;
  graphData?: GraphDataPoint[];
};

// Skeleton loading type
type StatCardSkeleton = {
  loading: true;
  bg: string;
};

// Union type for all possible configurations
type StatCardItem =
  | StatCardWithPieOrProgress
  | StatCardWithGraphLine
  | StatCardWithIcon
  | StatCardBasic
  | StatCardSkeleton;

// Props for CustomStatsCard
interface CustomStatsCardProps {
  data?: StatCardItem[];
  pieSize?: "sm" | "md" | "lg";
  pieColors?: string[];
  bgHighlight?: boolean;
  containerClass?: string;
  horizontal?: boolean;
  Variant?: "default" | "compact";
}

export default function CustomStatsCard({
  data,
  pieSize = "lg",
  bgHighlight = true,
  containerClass,
  Variant = "default",
}: CustomStatsCardProps) {
  const cards = Array.isArray(data) && data?.length > 0 ? data : [];
  // Dummy total for pie chart (sum of all values)
  // Pie chart colors - matching Tailwind config order
  const COLORS = [
    getColors().primary,
    getColors().secondary,
    getColors().success,
    getColors().tertiary,
    getColors().warning,
    getColors().neutral,
  ];

  // Only allow these keys for color lookup
  type ColorKey = keyof ReturnType<typeof getColors>;
  const colorKeys: ColorKey[] = [
    "primary",
    "secondary",
    "success",
    "tertiary",
    "warning",
    "neutral",
    "text",
    "bg",
  ];
  function safeGetColor(key: unknown, fallback: string) {
    return colorKeys.includes(key as ColorKey)
      ? getColors()[key as ColorKey]
      : fallback;
  }
  // Pie size
  const size = PIE_SIZES[pieSize] || PIE_SIZES.md;

  const bgClasses = [
    "!from-primary/10",
    "!from-secondary/10",
    "!from-success/10",
    "!from-tertiary/10",
    "!from-warning/10",
    "!from-neutral/10",
  ];

  const isDark = useSelector((state: RootState) => state.theme.mode === "dark");

  const ScheledonLoader = ({ bg }: { bg?: string }) => {
    const highlightColor =
      bg && colorKeys.includes(bg as ColorKey)
        ? getColors()[bg as ColorKey]
        : "#e5e7eb";
    return (
      <div
        className="w-full rounded-lg relative overflow-hidden"
        style={{
          height: "91.5px",
          backgroundColor: "#fff",
        }}
      >
        <div
          className="absolute inset-0 -translate-x-full animate-pulse"
          style={{
            background: `linear-gradient(90deg, transparent, ${highlightColor}20, transparent)`,
            animation: "shimmer 2s infinite",
          }}
        />
        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  };

  if (false) {
    return (
      <>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${containerClass}`}
        >
          {cards?.map((item: StatCardItem, index: number) => {
            {
              const bgColor = bgClasses?.find((bg: any) =>
                bg.includes((item as any)?.bg)
              );
              const isLoading =
                typeof item === "object" &&
                "loading" in item &&
                (item as any).loading;
              if (isLoading) {
                return (
                  <ContainerWrapper key={index} className="space-y-0 !p-0">
                    <ScheledonLoader bg={(item as any).bg} />
                  </ContainerWrapper>
                );
              }
              return (
                <ContainerWrapper
                  key={`${index}`}
                  className={`space-y-0 ${
                    bgHighlight
                      ? `!bg-gradient-to-t to-white from-primary/10`
                      : ""
                  } `}
                >
                  <div className="flex flex-col gap-6 ">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-full">
                          <div className="text-sm text-gray-600 dark:text-text_highlight  text-nowrap">
                            {(item as any)?.label}
                          </div>
                         
                            <div className="mt-2 text-3xl font-semibold text-text">
                              {(item as any)?.value}
                            </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-between h-16 ">
                        <div
                          className={`rounded-lg text-xs p-1 px-2 aspect-square flex items-center ${
                            ((item as any)?.percentageChange || 0) >= 0
                              ? "text-success"
                              : "text-warning"
                          }`}
                        >
                          {(item as any)?.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                </ContainerWrapper>
              );
            }
          })}
        </div>
      </>
    );
  }

  if (false) {
    return (
      <>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${containerClass}`}
        >
          {cards?.map((item: StatCardItem, index: number) => {
            {
              const bgColor = bgClasses?.find((bg: any) =>
                bg.includes((item as any)?.bg)
              );
              const isLoading =
                typeof item === "object" &&
                "loading" in item &&
                (item as any).loading;
              if (isLoading) {
                return (
                  <ContainerWrapper key={index} className="space-y-0 !p-0">
                    <ScheledonLoader bg={(item as any).bg} />
                  </ContainerWrapper>
                );
              }
              return (
                <ContainerWrapper
                  key={`${index}`}
                  className={`space-y-0 ${
                    bgHighlight
                      ? `!bg-gradient-to-t to-white from-primary/10`
                      : ""
                  } `}
                >
                  <div className="flex flex-col gap-6 ">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-full">
                          <div className="text-sm text-gray-600 dark:text-text_highlight  text-nowrap">
                            {(item as any)?.label}
                          </div>
                          {/* <div className=""> */}
                          {"showProgress" in item &&
                          item.showProgress &&
                          "horizontal" in item &&
                          item.horizontal &&
                          "total" in item &&
                          item.total ? (
                            <div className="w-full mt-3 mb-2 relative text-xl font-bold text-text">
                              <div className="h-2 rounded bg-neutral/10 flex relative">
                                <div
                                  className="h-2 rounded transition-all duration-500 relative"
                                  style={{
                                    width: `${Math.round(
                                      ((item.value || 0) / item.total) * 100
                                    )}%`,
                                    backgroundColor: safeGetColor(
                                      item.bg,
                                      COLORS[index % (COLORS.length || 1)]
                                    ),
                                  }}
                                >
                                  {/* Value label at the color connection */}
                                  <span
                                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-2 py-0.5 rounded-xl shadow text-xs font-bold"
                                    style={{
                                      left: "100%",
                                      background: "#fff",
                                      color: safeGetColor(
                                        item.bg,
                                        COLORS[index % (COLORS.length || 1)]
                                      ),
                                      whiteSpace: "nowrap",
                                      border: `1px solid ${safeGetColor(
                                        item.bg,
                                        COLORS[index % (COLORS.length || 1)]
                                      )}`,
                                      zIndex: 20,
                                    }}
                                  >
                                    {(item as any)?.value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-3xl font-semibold text-text">
                              {(item as any)?.value}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-between h-16 ">
                        <div
                          className={`border rounded-lg text-xs p-1 px-2 ${
                            ((item as any)?.percentageChange || 0) >= 0
                              ? "text-success"
                              : "text-warning"
                          }`}
                        >
                          {(item as any)?.percentageChange}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center items-start">
                      <div
                        data-slot="card-footer"
                        className="flex flex-col items-start gap-1.5 text-sm w-full"
                      >
                        <div className="line-clamp-1 flex gap-2 font-medium text-text_highlight">
                          {typeof (item as any)?.percentageChange ===
                          "number" ? (
                            <>
                              <span className={`flex items-center gap-1 `}>
                                {((item as any)?.percentageChange || 0) >= 0 ? (
                                  <>
                                    Up{" "}
                                    <span
                                      className={`flex items-center gap-1 text-success`}
                                    >
                                      {Math.abs(
                                        (item as any)?.percentageChange
                                      )}
                                      %
                                    </span>{" "}
                                    this period
                                  </>
                                ) : (
                                  <>
                                    Down{" "}
                                    <span className="flex items-center gap-1 text-warning">
                                      {Math.abs(
                                        (item as any)?.percentageChange
                                      )}
                                      %
                                    </span>
                                    this period
                                  </>
                                )}
                              </span>
                            </>
                          ) : null}
                        </div>
                        <div className="text-text">
                          Acquisition needs attention
                        </div>
                      </div>
                       {typeof (item as any)?.percentageChange === "number" ? (
                          ((item as any)?.percentageChange ?? 0) >= 0 ? (
                            <TrendingUp className="w-6 h-6 text-success" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-warning" />
                          )
                        ) : null}
                    </div>
                  </div>
                </ContainerWrapper>
              );
            }
          })}
        </div>
      </>
    );
  }

  //sdsdsds

  return (
    <>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${containerClass}`}
      >
        {cards?.map((item: StatCardItem, index: number) => {
          {
            const bgColor = bgClasses?.find((bg: any) =>
              bg.includes((item as any)?.bg)
            );
            const isLoading =
              typeof item === "object" &&
              "loading" in item &&
              (item as any).loading;
            if (isLoading) {
              return (
                <ContainerWrapper key={index} className="space-y-0 !p-0">
                  <ScheledonLoader bg={(item as any).bg} />
                </ContainerWrapper>
              );
            }
            return (
              <ContainerWrapper
                key={`${index}`}
                className={`space-y-0 !p-3 ${
                  bgHighlight ? `!bg-gradient-to-r to-white ${bgColor}` : ""
                } `}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    {"showPie" in item &&
                      item?.showPie &&
                      "total" in item &&
                      item?.total && (
                        <div
                          className=" overflow-hidden flex items-center justify-center flex-shrink-0"
                          style={{ width: size?.width, height: size?.height }}
                        >
                          <ResponsiveContainer
                            width={size?.width}
                            height={size?.height}
                          >
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: (item as any)?.label,
                                    value: (item as any)?.value,
                                  },
                                  {
                                    name: "Other",
                                    value: Math.max(
                                      (item as any).total -
                                        ((item as any)?.value || 0),
                                      0
                                    ),
                                  },
                                ]}
                                dataKey="value"
                                innerRadius={size?.innerRadius}
                                outerRadius={size?.outerRadius}
                                startAngle={90}
                                endAngle={-270}
                                cornerRadius={6}
                                stroke="none"
                                label={({ cx, cy }) => (
                                  <text
                                    x={cx}
                                    y={cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={size.width > 36 ? 10 : 8}
                                    fill="var(--color-text)"
                                    fontWeight="bold"
                                  >
                                    {Math.round(
                                      (((item as any)?.value || 0) /
                                        ((item as any).total || 1)) *
                                        100
                                    )}
                                    %
                                  </text>
                                )}
                                labelLine={false}
                              >
                                <Cell
                                  key="main"
                                  fill={safeGetColor(
                                    (item as any)?.bg,
                                    COLORS?.[index % (COLORS?.length || 1)]
                                  )}
                                />
                                {/* <Cell key="rest" fill={} /> */}
                                <Cell
                                  key="rest"
                                  fill={isDark ? getColors().bg : "#d4d4d4"}
                                />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    {"showIcon" in item &&
                      item?.showIcon &&
                      "icon" in item &&
                      item?.icon && (
                        <div className="flex items-center justify-center flex-shrink-0">
                          {(item as any)?.icon}
                        </div>
                      )}
                    <div className="flex-1 min-w-full">
                      <div className="text-sm font-semibold text-gray-600 dark:text-text_highlight leading-tight text-nowrap">
                        {(item as any)?.label}
                      </div>
                      {/* <div className=""> */}
                      {"showProgress" in item &&
                      item.showProgress &&
                      "horizontal" in item &&
                      item.horizontal &&
                      "total" in item &&
                      item.total ? (
                        <div className="w-full mt-3 mb-2 relative text-xl font-bold text-text">
                          <div className="h-2 rounded bg-neutral/10 flex relative">
                            <div
                              className="h-2 rounded transition-all duration-500 relative"
                              style={{
                                width: `${Math.round(
                                  ((item.value || 0) / item.total) * 100
                                )}%`,
                                backgroundColor: safeGetColor(
                                  item.bg,
                                  COLORS[index % (COLORS.length || 1)]
                                ),
                              }}
                            >
                              {/* Value label at the color connection */}
                              <span
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-2 py-0.5 rounded-xl shadow text-xs font-bold"
                                style={{
                                  left: "100%",
                                  background: "#fff",
                                  color: safeGetColor(
                                    item.bg,
                                    COLORS[index % (COLORS.length || 1)]
                                  ),
                                  whiteSpace: "nowrap",
                                  border: `1px solid ${safeGetColor(
                                    item.bg,
                                    COLORS[index % (COLORS.length || 1)]
                                  )}`,
                                  zIndex: 20,
                                }}
                              >
                                {(item as any)?.value}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-0.5 text-xl font-bold text-text">
                          {(item as any)?.value}
                        </div>
                      )}
                      {/* </div> */}
                      {"percentageChange" in item &&
                        (item as any)?.percentageChange !== undefined && (
                          <div className="mt-0.5 flex gap-1">
                            <div
                              className={`text-xs leading-tight  ${
                                ((item as any)?.percentageChange || 0) >= 0
                                  ? "text-success"
                                  : "text-warning"
                              }`}
                            >
                              {((item as any)?.percentageChange || 0) >= 0
                                ? "+"
                                : ""}
                              {(item as any)?.percentageChange}%
                            </div>
                            <div className="text-xs text-text_highlight">
                              This month
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {!(
                    "showProgress" in item &&
                    item.showProgress &&
                    "horizontal" in item &&
                    item.horizontal
                  ) && (
                    <div className="flex flex-col items-center flex-shrink-0">
                      {"showGraphLine" in item &&
                      (item as any)?.showGraphLine &&
                      "graphData" in item &&
                      (item as any)?.graphData ? (
                        // Small line chart with area fill
                        <div className="w-16 h-12 overflow-hidden">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={(item as any).graphData}
                              margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                            >
                              <defs>
                                <linearGradient
                                  id={`colorGradient${index}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor={safeGetColor(
                                      (item as any)?.bg,
                                      COLORS?.[index % (COLORS?.length || 1)]
                                    )}
                                    stopOpacity={0.4}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor={safeGetColor(
                                      (item as any)?.bg,
                                      COLORS?.[index % (COLORS?.length || 1)]
                                    )}
                                    stopOpacity={0.1}
                                  />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" hide />
                              <YAxis hide />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke={safeGetColor(
                                  (item as any)?.bg,
                                  COLORS?.[index % (COLORS?.length || 1)]
                                )}
                                strokeWidth={1.5}
                                fill={`url(#colorGradient${index})`}
                                dot={false}
                                activeDot={false}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        // Default vertical progress bar (only if not horizontal progress)
                        !(
                          "showProgress" in item &&
                          item.showProgress &&
                          "horizontal" in item &&
                          item.horizontal
                        ) && (
                          <>
                            <div className="w-1.5 h-12 rounded bg-neutral/10 overflow-hidden flex flex-col justify-end">
                              <div
                                className="w-1.5 rounded transition-all duration-500"
                                style={{
                                  height:
                                    "showProgress" in item &&
                                    (item as any)?.showProgress &&
                                    "total" in item &&
                                    (item as any)?.total
                                      ? `${Math.round(
                                          (((item as any)?.value || 0) /
                                            (item as any)?.total) *
                                            100
                                        )}%`
                                      : "0%",
                                  backgroundColor: safeGetColor(
                                    (item as any)?.bg,
                                    COLORS?.[index % (COLORS?.length || 1)]
                                  ),
                                }}
                              />
                            </div>
                            <div className="text-xs text-text_highlight mt-0.5 text-center">
                              {"showProgress" in item &&
                              (item as any)?.showProgress &&
                              "total" in item &&
                              (item as any)?.total
                                ? `${Math.round(
                                    (((item as any)?.value || 0) /
                                      ((item as any)?.total || 1)) *
                                      100
                                  )}%`
                                : "0%"}
                            </div>
                          </>
                        )
                      )}
                    </div>
                  )}
                </div>
              </ContainerWrapper>
            );
          }
        })}
      </div>
    </>
  );
}
