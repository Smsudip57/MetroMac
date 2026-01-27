"use client";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import SingleDatePickerHF from "@/components/reuseable/forms/WithHookForm/SingleDatePickerHF";
import SearchSelectHF from "@/components/reuseable/forms/WithHookForm/SearchSelectHF";
import { Button } from "@/components/ui/button";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
import { ControlledPopover } from "@/components/ui/popover";
import { X, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import { useGetUsersQuery } from "@/redux/api/users/userApi";

type FilterTaskModalProps = {
  onApplyFilters: (filters: {
    fromDate?: string;
    toDate?: string;
    assignedTo?: string;
    reporterId?: string;
  }) => void;
  filterButtonRef?: React.RefObject<HTMLButtonElement>;
};

export default function FilterTaskModal({
  onApplyFilters,
  filterButtonRef,
}: FilterTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const methods = useForm({
    defaultValues: {
      fromDate: "",
      toDate: "",
      assignedTo: null,
      reporterId: null,
    },
  });

  const handleApplyFilters = () => {
    let fromDate = methods.getValues("fromDate");
    let toDate = methods.getValues("toDate");
    const assignedTo = methods.getValues("assignedTo") as any;
    const reporterId = methods.getValues("reporterId") as any;

    // Convert local dates to UTC ISO strings for backend
    if (fromDate) {
      const localDate = new Date(fromDate);
      // Create UTC date string
      fromDate = new Date(
        localDate.getTime() - localDate.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];
    }

    if (toDate) {
      const localDate = new Date(toDate);
      // Create UTC date string
      toDate = new Date(
        localDate.getTime() - localDate.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];
    }

    // Validate date range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        toast.error("From date must be before or equal to To date");
        return;
      }
    }

    onApplyFilters({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      assignedTo: assignedTo?.value || undefined,
      reporterId: reporterId?.value || undefined,
    });

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
    onApplyFilters({});
    setIsOpen(false);
    toast.success("Filters cleared");
  };

  return (
    <>
      <button
        ref={filterButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center"
        title="Filter tasks"
        type="button"
      >
        <Filter size={20} className="text-gray-600" />
      </button>

      {filterButtonRef?.current && (
        <ControlledPopover
          open={isOpen}
          onOpenChange={setIsOpen}
          anchorRef={filterButtonRef}
          placement="bottom-right"
          className="!p-0 !z-[50] w-max"
        >
          <ContainerWrapper
            className="!p-0 w-[340px] shadow-primary flex flex-col"
            style={{ boxShadow: "0 10px 30px #6157ff24", overflow: "visible" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-primary" />
                  <h3 className="text-sm font-semibold text-text">
                    Filter Tasks
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  type="button"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="px-4 py-4 space-y-4">
              <FormProvider {...methods}>
                <div className="space-y-4">
                  <div>
                    <SearchSelectHF
                      name="assignedTo"
                      label="Assigned To"
                      searchable
                      placeholder="Search and select assignee"
                      onScrollLoadMore={true}
                      rtkQueryHook={useGetUsersQuery}
                      mapOption={(user: any) => ({
                        value: user.id.toString(),
                        label: `${user.firstName} ${user.lastName}`,
                      })}
                      defaultParams={{ limit: 100 }}
                    />
                  </div>
                  <div>
                    <SearchSelectHF
                      name="reporterId"
                      label="Assigned By (Reporter)"
                      searchable
                      placeholder="Search and select reporter"
                      onScrollLoadMore={true}
                      rtkQueryHook={useGetUsersQuery}
                      mapOption={(user: any) => ({
                        value: user.id.toString(),
                        label: `${user.firstName} ${user.lastName}`,
                      })}
                      defaultParams={{ limit: 100 }}
                    />
                  </div>
                  <div>
                    <SingleDatePickerHF
                      name="fromDate"
                      label="From Date"
                      placeholder="Select start date"
                    />
                  </div>

                  <div>
                    <SingleDatePickerHF
                      name="toDate"
                      label="To Date"
                      placeholder="Select end date"
                    />
                  </div>
                </div>
              </FormProvider>
            </div>

            {/* Divider */}
            <div className="border-t border-border flex-shrink-0"></div>

            {/* Action Buttons */}
            <div className="px-4 py-3 bg-gray-50/50 flex-shrink-0 flex gap-2">
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
          </ContainerWrapper>
        </ControlledPopover>
      )}
    </>
  );
}
