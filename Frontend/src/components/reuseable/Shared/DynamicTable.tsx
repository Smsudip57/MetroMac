import TableEditIcon from "@/assets/icons/shared/EditIcon";
import Checkbox from "@/components/reuseable/forms/Checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import CustomPageLimit from "./CustomPageLimit";
import CustomPagination from "./CustomPagination";
import TableLoadingSkeleton from "./TableLoadingSkeleton";
import DeleteIcon from "@/assets/icons/shared/DeleteIcon";
import { BiSupport } from "react-icons/bi";
import { FiEye } from "react-icons/fi";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import ContainerWrapper from "../wrapper/ContainerWrapper";

interface SwitchConfig {
  key: string;
  label?: string;
  checked?: (item: any) => boolean;
  disabled?: (item: any) => boolean;
  onChange?: (item: any, checked: boolean) => void;
  className?: string;
}

interface IconConfig {
  view?: React.ReactNode | ((item: any) => React.ReactNode);
  edit?: React.ReactNode | ((item: any) => React.ReactNode);
  support?: React.ReactNode | ((item: any) => React.ReactNode);
  delete?: React.ReactNode | ((item: any) => React.ReactNode);
}

interface Column {
  key: string;
  header: string;
  sortable?: boolean; // Make column sortable
  sortKey?: string; // Custom sort field (for nested objects like customer.name)
  cell?: (item: any, index: number) => React.ReactNode;
  switch?: SwitchConfig;
  className?: string;
  width?: string | number;
}

interface PaginationProps {
  enabled: boolean;
  pageSize: number;
  pageSizeOptions?: number[];
  totalRecords: number;
  currentPage: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

interface DynamicTableProps {
  className?: string;
  data: any[];
  columns: Column[];
  startIndex?: number;
  options?: {
    selectable?: boolean;
    actions?: {
      edit?: boolean;
      view?: boolean;
      support?: boolean;
      delete?: boolean;
    };
    // it will be removed later just keep it to ui not going to crash
    pagination?: {
      enabled: boolean;
      pageSize?: number;
      pageSizeOptions?: number[];
    };
  };
  onRowSelect?: (selectedItems: any[]) => void;
  onSwitchToggle?: (item: any, isChecked: boolean) => void;
  onEdit?: (item: any) => void;
  onView?: (item: any, trigger?: HTMLElement) => void;
  onDelete?: (item: any) => void;
  onSupport?: (item: any) => void;
  isLoading?: boolean;
  pagination?: PaginationProps;
  // Sorting props
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
  } | null;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  // Column divider prop
  showColumnDividers?: boolean;
  // Custom icons for actions
  icons?: IconConfig;
}

export function DynamicTable({
  data,
  columns,
  startIndex = 1,
  options = {},
  onRowSelect,
  onSwitchToggle,
  onEdit,
  onView,
  onSupport,
  onDelete,
  className,
  isLoading = false,
  pagination,
  sortConfig,
  onSort,
  showColumnDividers = false,
  icons = {},
}: DynamicTableProps) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  // Default icons - maintain current system
  const defaultIcons = {
    view: <FiEye size={16} />,
    edit: <TableEditIcon width={16} height={16} fill="currentColor" />,
    support: <BiSupport className="w-4 h-4" />,
    delete: <DeleteIcon width={16} height={16} fill="currentColor" />,
  };

  // Merge provided icons with defaults
  const mergedIcons = { ...defaultIcons, ...icons };
  // const [currentPage, setCurrentPage] = useState(1);
  // const [pageSize, setPageSize] = useState(
  //     options.pagination?.pageSize || 10
  // );

  // Handle column sorting
  const handleSort = (column: Column) => {
    if (!column.sortable || !onSort) return;

    const sortKey = column.sortKey || column.key;
    const currentDirection =
      sortConfig?.key === sortKey ? sortConfig.direction : null;

    let newDirection: "asc" | "desc" = "asc";
    if (currentDirection === "asc") {
      newDirection = "desc";
    } else if (currentDirection === "desc") {
      newDirection = "asc";
    }

    onSort(sortKey, newDirection);
  };

  // Get sort icon for column
  const getSortIcon = (column: Column) => {
    if (!column.sortable) return null;

    const sortKey = column.sortKey || column.key;
    const isActive = sortConfig?.key === sortKey;

    if (!isActive) {
      return (
        <div className="flex flex-col ml-1 opacity-50">
          <ChevronUpIcon className="h-2.5 w-2.5 -mb-0.5" />
          <ChevronDownIcon className="h-2.5 w-2.5" />
        </div>
      );
    }

    if (sortConfig?.direction === "asc") {
      return <ChevronUpIcon className="h-3 w-3 ml-1 text-primary" />;
    } else {
      return <ChevronDownIcon className="h-3 w-3 ml-1 text-primary" />;
    }
  };

  const handleSelectItem = (item: any) => {
    const newSelectedItems = selectedItems.includes(item)
      ? selectedItems?.filter((i) => i !== item)
      : [...selectedItems, item];
    setSelectedItems(newSelectedItems);
    onRowSelect?.(newSelectedItems);
  };

  const handleSelectAll = () => {
    if (!data || data.length === 0) return;

    const newSelectedItems =
      selectedItems.length === data.length ? [] : [...data];
    setSelectedItems(newSelectedItems);
    onRowSelect?.(newSelectedItems);
  };

  // useEffect(() => {
  //     setCurrentPage(1);
  // }, [pageSize]);

  if (isLoading) return <TableLoadingSkeleton />;

  return (
    <div className={cn("w-full border-none ")}>
      {" "}
      <div
        className={cn(
          "w-full overflow-x-auto border-none min-h-[calc(100vh-650px)]",
          className
        )}
      >
        <ContainerWrapper className="!p-0 !border-black border">
          <Table className="w-full">
            <TableHeader className="bg-primary/10 rounded-2xl ">
              <TableRow className="border-none hover:bg-transparent !rounded-2xl">
                {options.selectable && (
                  <TableHead className="w-[50px] rounded-lt-lg pl-6 align-middle  !h-10">
                    <div className="flex items-center justify-start">
                      <Checkbox
                        label=""
                        isChecked={
                          selectedItems.length === data?.length &&
                          data?.length > 0
                        }
                        onToggle={handleSelectAll}
                      />
                    </div>
                  </TableHead>
                )}
                {columns?.map((column, index) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      `text-text_highlight font- md:text-sm text-xs  !h-10 ${
                        index === 0 && !options.selectable
                          ? "rounded-lt-lg pl-6"
                          : "pl-4"
                      } ${
                        column.sortable
                          ? "cursor-pointer hover:bg-primary/5 select-none"
                          : ""
                      } ${
                        showColumnDividers ? "border-r border-black" : ""
                      }`,
                      column.className
                    )}
                    style={
                      column.width
                        ? {
                            width:
                              typeof column.width === "number"
                                ? `${column.width}px`
                                : column.width,
                            minWidth:
                              typeof column.width === "number"
                                ? `${column.width}px`
                                : column.width,
                          }
                        : undefined
                    }
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {getSortIcon(column)}
                    </div>
                  </TableHead>
                ))}

                {options.actions &&
                  (options.actions.view ||
                    options.actions.edit ||
                    options.actions.support ||
                    options.actions.delete) && (
                    <TableHead className="text-text_highlight md:text-sm text-xs text-center !h-7">
                      Actions
                    </TableHead>
                  )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data) &&
                data?.map((item: any, index: number) => (
                  <TableRow
                    key={item.id || index}
                    className={`  border-b border-black !ml-6`}
                  >
                    {options.selectable && (
                      <TableCell className="w-[50px] pl-6 align-middle ">
                        <div className="flex items-center justify-start">
                          <Checkbox
                            label=""
                            isChecked={selectedItems.includes(item)}
                            onToggle={() => handleSelectItem(item)}
                          />
                        </div>
                      </TableCell>
                    )}
                    {columns?.map((column, ind) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          `text-text md:text-sm text-xs ${
                            ind === 0 && !options.selectable
                              ? "rounded-l-lg pl-6"
                              : "pl-4"
                          } ${
                            showColumnDividers ? "border-r border-black" : ""
                          }`,
                          column.className
                        )}
                        style={
                          column.width
                            ? {
                                width:
                                  typeof column.width === "number"
                                    ? `${column.width}px`
                                    : column.width,
                                minWidth:
                                  typeof column.width === "number"
                                    ? `${column.width}px`
                                    : column.width,
                              }
                            : undefined
                        }
                      >
                        {column.switch ? (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={
                                column.switch.checked
                                  ? column.switch.checked(item)
                                  : item[column.switch.key]
                              }
                              disabled={
                                column.switch.disabled
                                  ? column.switch.disabled(item)
                                  : false
                              }
                              onCheckedChange={(checked) =>
                                column?.switch?.onChange
                                  ? column.switch.onChange(item, checked)
                                  : onSwitchToggle?.(item, checked)
                              }
                              className={column.switch.className}
                            />
                            {column.switch.label && (
                              <span>{column.switch.label}</span>
                            )}
                          </div>
                        ) : column.cell ? (
                          column.cell(item, index + startIndex)
                        ) : null}
                      </TableCell>
                    ))}
                    {options.actions &&
                      (options.actions.view ||
                        options.actions.support ||
                        options.actions.edit ||
                        options.actions.delete) && (
                        <TableCell className="bg-bg">
                          <div className="flex items-center gap-2 justify-center">
                            {options.actions.view && (
                              <button
                                onClick={(e) =>
                                  onView?.(item, e.currentTarget as HTMLElement)
                                }
                                className="w-7 h-7 bg-primary/10 text-primary flex justify-center items-center rounded-lg"
                              >
                                {typeof mergedIcons.view === "function"
                                  ? mergedIcons.view(item)
                                  : mergedIcons.view}
                              </button>
                            )}

                            {options.actions.edit && (
                              <button
                                onClick={() => onEdit?.(item)}
                                className="w-7 h-7 bg-secondary/10 text-secondary flex justify-center items-center rounded-lg"
                              >
                                {typeof mergedIcons.edit === "function"
                                  ? mergedIcons.edit(item)
                                  : mergedIcons.edit}
                              </button>
                            )}

                            {options.actions.support && (
                              <button
                                onClick={() => onSupport?.(item)}
                                className="w-7 h-7 bg-tertiary/10 text-tertiary flex justify-center items-center rounded-lg"
                              >
                                {typeof mergedIcons.support === "function"
                                  ? mergedIcons.support(item)
                                  : mergedIcons.support}
                              </button>
                            )}

                            {options.actions.delete && (
                              <button
                                onClick={() => onDelete?.(item)}
                                className="w-7 h-7 bg-warning/10 text-warning flex justify-center items-center rounded-lg"
                              >
                                {typeof mergedIcons.delete === "function"
                                  ? mergedIcons.delete(item)
                                  : mergedIcons.delete}
                              </button>
                            )}
                          </div>
                        </TableCell>
                      )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </ContainerWrapper>
      </div>
      {Array(data) && data?.length == 0 && (
        <p className="text-gray-500 font-medium mt-6 text-center text-lg">
          {/* (´•︵•`) */}
          <br />
          Nothing Found!
        </p>
      )}
      {/* Todo it will be removed later after api integration its keep only for ui remain same or not going to  crash */}
      {/* {options.pagination?.enabled && data?.length > 5 && (
                <div className="flex justify-between sm:items-center items-end gap-2.5 mt-4">
                    <CustomPageLimit
                        options={
                            options.pagination.pageSizeOptions || [
                                5, 10, 20, 30,
                            ]
                        }
                        value={pageSize}
                        onChange={(value) => setPageSize(value)}
                    />
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={data?.length / pageSize}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )} */}
      {pagination?.enabled && (
        <div className="flex justify-between flex-wrap sm:items-center items-end sm:gap-8 gap-3 mt-4">
          <CustomPageLimit
            options={pagination.pageSizeOptions || [5, 10, 20, 30]}
            value={pagination.pageSize}
            onChange={pagination.onPageSizeChange}
          />
          <CustomPagination
            currentPage={pagination.currentPage}
            totalPages={
              typeof pagination.totalPages === "number"
                ? pagination.totalPages
                : Math.ceil(pagination.totalRecords / pagination.pageSize)
            }
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
