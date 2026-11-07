"use client";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import SingleDatePickerHF from "@/components/reuseable/forms/WithHookForm/SingleDatePickerHF";
import SearchSelectHF from "@/components/reuseable/forms/WithHookForm/SearchSelectHF";
import { Button } from "@/components/ui/button";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
import { ControlledPopover } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { X, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import { useGetUsersQuery } from "@/redux/api/users/userApi";

const STATUS_OPTIONS = [
  { key: "pending", label: "Pending" },
  { key: "assigned", label: "Assigned" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "submitted", label: "Submitted" },
  { key: "on_hold", label: "On Hold" },
  { key: "rework", label: "Rework" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

type AppliedFilters = {
  fromDate?: string;
  toDate?: string;
  assignedTo?: string;
  reporterId?: string;
  statuses?: string[];
};

type FilterTaskModalProps = {
  onApplyFilters: (filters: AppliedFilters) => void;
  filterButtonRef?: React.RefObject<HTMLButtonElement>;
  activeCount?: number;
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}

function StatusChips({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {STATUS_OPTIONS.map((opt) => {
        const active = selected.includes(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onToggle(opt.key)}
            className={`h-8 px-2 rounded-md text-xs font-medium border transition-colors touch-manipulation truncate ${
              active
                ? "bg-primary text-white border-primary"
                : "bg-white text-text border-border hover:border-primary/40"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterFields({
  methods,
  selectedStatuses,
  onToggleStatus,
  onClearStatuses,
}: {
  methods: any;
  selectedStatuses: string[];
  onToggleStatus: (key: string) => void;
  onClearStatuses: () => void;
}) {
  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-text">Status</p>
            {selectedStatuses.length > 0 && (
              <button
                type="button"
                className="text-xs text-primary"
                onClick={onClearStatuses}
              >
                Clear statuses
              </button>
            )}
          </div>
          <StatusChips selected={selectedStatuses} onToggle={onToggleStatus} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SearchSelectHF
            name="assignedTo"
            label="Assigned To"
            searchable
            placeholder="Search assignee"
            onScrollLoadMore={true}
            rtkQueryHook={useGetUsersQuery}
            mapOption={(user: any) => ({
              value: user.id.toString(),
              label: `${user.firstName} ${user.lastName}`,
            })}
            defaultParams={{ limit: 100 }}
          />
          <SearchSelectHF
            name="reporterId"
            label="Assigned By"
            searchable
            placeholder="Search reporter"
            onScrollLoadMore={true}
            rtkQueryHook={useGetUsersQuery}
            mapOption={(user: any) => ({
              value: user.id.toString(),
              label: `${user.firstName} ${user.lastName}`,
            })}
            defaultParams={{ limit: 100 }}
          />
          <SingleDatePickerHF
            name="fromDate"
            label="From Date"
            placeholder="Select start date"
          />
          <SingleDatePickerHF
            name="toDate"
            label="To Date"
            placeholder="Select end date"
          />
        </div>
      </div>
    </FormProvider>
  );
}

export default function FilterTaskModal({
  onApplyFilters,
  filterButtonRef,
  activeCount = 0,
}: FilterTaskModalProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const methods = useForm({
    defaultValues: {
      fromDate: "",
      toDate: "",
      assignedTo: null,
      reporterId: null,
    },
  });

  const toggleStatus = (key: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  };

  const buildPayload = (): AppliedFilters | null => {
    let fromDate = methods.getValues("fromDate");
    let toDate = methods.getValues("toDate");
    const assignedTo = methods.getValues("assignedTo") as any;
    const reporterId = methods.getValues("reporterId") as any;

    if (fromDate) {
      const localDate = new Date(fromDate);
      fromDate = new Date(
        localDate.getTime() - localDate.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];
    }
    if (toDate) {
      const localDate = new Date(toDate);
      toDate = new Date(
        localDate.getTime() - localDate.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];
    }
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      toast.error("From date must be before or equal to To date");
      return null;
    }

    return {
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      assignedTo: assignedTo?.value || undefined,
      reporterId: reporterId?.value || undefined,
      statuses: selectedStatuses.length ? selectedStatuses : undefined,
    };
  };

  const handleApplyFilters = () => {
    const payload = buildPayload();
    if (!payload) return;
    onApplyFilters(payload);
    setIsOpen(false);
    toast.success("Filters applied successfully");
  };

  const handleClearFilters = () => {
    methods.reset({
      fromDate: "",
      toDate: "",
      assignedTo: null,
      reporterId: null,
    });
    setSelectedStatuses([]);
    onApplyFilters({});
    setIsOpen(false);
    toast.success("Filters cleared");
  };

  const triggerButton = (
    <button
      ref={filterButtonRef}
      onClick={() => setIsOpen(!isOpen)}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center shrink-0"
      title="Filter tasks"
      type="button"
    >
      <Filter size={20} className="text-gray-600" />
      {activeCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] leading-4 text-center">
          {activeCount}
        </span>
      )}
    </button>
  );

  const actions = (
    <div className="flex gap-2 w-full">
      <Button
        type="button"
        onClick={handleClearFilters}
        variant="outline"
        className="flex-1 rounded-lg"
        size="sm"
      >
        Clear
      </Button>
      <Button
        type="button"
        onClick={handleApplyFilters}
        className="flex-1 rounded-lg"
        size="sm"
      >
        Apply
      </Button>
    </div>
  );

  return (
    <>
      {triggerButton}

      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl p-0 max-h-[85vh] flex flex-col !bg-bg border-border text-text"
          >
            <SheetHeader className="px-4 pt-4 pb-3 border-b border-border text-left bg-bg">
              <SheetTitle className="flex items-center gap-2 text-base text-text">
                <Filter size={18} className="text-primary" />
                Filter Tasks
              </SheetTitle>
            </SheetHeader>
            <div className="px-4 py-4 overflow-y-auto flex-1 overscroll-contain bg-bg">
              <FilterFields
                methods={methods}
                selectedStatuses={selectedStatuses}
                onToggleStatus={toggleStatus}
                onClearStatuses={() => setSelectedStatuses([])}
              />
            </div>
            <SheetFooter className="px-4 py-3 border-t border-border bg-bg_shade">
              {actions}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        filterButtonRef?.current && (
          <ControlledPopover
            open={isOpen}
            onOpenChange={setIsOpen}
            anchorRef={filterButtonRef}
            placement="bottom-right"
            className="!p-0 !z-[50] w-max"
          >
            <ContainerWrapper
              className="!p-0 w-[min(520px,calc(100vw-24px))] shadow-primary flex flex-col bg-bg"
              style={{ boxShadow: "0 10px 30px #6157ff24", overflow: "visible" }}
            >
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-primary" />
                  <h3 className="text-sm font-semibold text-text">
                    Filter Tasks
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                  type="button"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
              <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">
                <FilterFields
                  methods={methods}
                  selectedStatuses={selectedStatuses}
                  onToggleStatus={toggleStatus}
                  onClearStatuses={() => setSelectedStatuses([])}
                />
              </div>
              <div className="border-t border-border px-4 py-3 bg-bg_shade">
                {actions}
              </div>
            </ContainerWrapper>
          </ControlledPopover>
        )
      )}
    </>
  );
}
