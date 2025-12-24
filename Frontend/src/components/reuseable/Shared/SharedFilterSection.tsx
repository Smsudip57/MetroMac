import React, {useState} from "react";
import FilterButton from "../buttons/FilterButton";
import ResetButton from "../buttons/ResetButton";
import {Search} from "lucide-react";
import FileExportSelect from "../forms/WithoutHookForm/FileExportSelect";
import SingleDatePicker from "../forms/WithoutHookForm/SingleDatePicker";
import {LuSearch} from "react-icons/lu";
import {toast} from "react-hot-toast";
import {useDebounce} from "@/hooks/useDebounce";

interface SharedFilterSectionProps {
    showDateRange?: boolean;
    showSearch?: boolean;
    showExport?: boolean;
    handleSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    queryParams: any;
    setQueryParams: (value: any) => void;
    downloadUrl?: string;
    onFilter?: () => void;
    onReset?: () => void;
    placeholder?: string;
    resetCounter?: number;
    children?: React.ReactNode;
}

export const SharedFilterSection = ({
    showDateRange = true,
    showSearch = true,
    showExport = true,
    queryParams,
    setQueryParams,
    downloadUrl,
    onFilter,
    onReset,
    placeholder,
    resetCounter,
    children,
}: SharedFilterSectionProps) => {
    // Local state for from_date and to_date
    const [localFromDate, setLocalFromDate] = useState(
        queryParams.from_date || ""
    );
    const [localToDate, setLocalToDate] = useState(queryParams.to_date || "");

    // Local state for search input
    const [localSearchValue, setLocalSearchValue] = useState(
        queryParams.search || ""
    );

    // Debounced search term
    const debouncedSearchTerm = useDebounce(localSearchValue, 500);

    // When the search button is clicked, set from_date and to_date in queryParams
    const handleDateSearch = () => {
        if (
            localFromDate &&
            localToDate &&
            new Date(localToDate) < new Date(localFromDate)
        ) {
            toast.error("To Date cannot be earlier than From Date.");
            return;
        }
        setQueryParams((prev: any) => ({
            ...prev,
            ...(localFromDate && {from_date: localFromDate}),
            ...(localToDate && {to_date: localToDate}),
        }));
    };

    // Handle local search input change
    const handleLocalSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearchValue(event.target.value);
    };

    // Keep local state in sync with queryParams if they change externally
    React.useEffect(() => {
        setLocalFromDate(queryParams.from_date || "");
        setLocalToDate(queryParams.to_date || "");
        setLocalSearchValue(queryParams.search || "");
    }, [
        queryParams.from_date,
        queryParams.to_date,
        queryParams.search,
        resetCounter,
    ]);

    // Update parent queryParams when debounced search term changes
    React.useEffect(() => {
        setQueryParams((prev: any) => ({
            ...prev,
            search: debouncedSearchTerm,
        }));
    }, [debouncedSearchTerm, setQueryParams]);

    return (
        <div>
            {/* large screen */}
            <div
                className={`md:flex  hidden items-center w-full gap-4 ${
                    showDateRange ? "justify-between" : "justify-end"
                }`}>
                {showDateRange && (
                    <div className="flex items-center gap-2">
                        <SingleDatePicker
                            placeholder="From Date"
                            triggerClassName="h-10 w-36 rounded-xl bg-light-alpha-white"
                            value={localFromDate || null}
                            onChange={(value: any) =>
                                setLocalFromDate(value || "")
                            }
                        />
                        <div className="w-4 h-[2px] bg-light-stroke-beta -mx-1" />
                        <SingleDatePicker
                            placeholder="To Date"
                            triggerClassName="h-10 w-36 rounded-xl bg-light-alpha-white"
                            value={localToDate || null}
                            onChange={(value: any) =>
                                setLocalToDate(value || "")
                            }
                            position="end"
                        />
                        <div className="relative">
                            <button
                                onClick={handleDateSearch}
                                className="size-10 rounded-xl !p-1 bg-light-emerald-base flex items-center justify-center"
                                type="button">
                                <LuSearch className="text-light-alpha-white text-xl" />
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex items-center  gap-2.5">
                    <div> {children}</div>
                    {onFilter && <FilterButton onClick={onFilter} />}

                    {onReset && <ResetButton onClick={onReset} />}

                    {showSearch && (
                        /* Search field */
                        <div className="relative flex items-center w-full">
                            <input
                                type="text"
                                value={localSearchValue}
                                onChange={handleLocalSearch}
                                placeholder={placeholder || "Search here..."}
                                className="h-10 px-4 py-3.5 bg-transparent rounded-xl border-[1.5px] border-light-stroke-beta md:text-sm text-xs focus:outline-none focus:border-light-emerald-base lg:w-64 !w-full placeholder:text-light-beta font-medium text-light-alpha"
                            />
                            <Search className="absolute right-3 text-light-emerald-dark size-5" />
                        </div>
                    )}

                    {showExport && (
                        <FileExportSelect
                            value={queryParams.export_as}
                            onChange={(value) =>
                                setQueryParams((prev: any) => ({
                                    ...prev,
                                    export_as: value,
                                }))
                            }
                            downloadUrl={downloadUrl}
                        />
                    )}
                </div>
            </div>

            {/* medium to small screen */}
            <div className="md:hidden">
                <div
                    className={`flex   items-center w-full sm:gap-2.5 gap-1.5 ${
                        showDateRange ? "justify-between" : "justify-end"
                    }`}>
                    {showDateRange && (
                        <div className="flex items-center gap-1.5">
                            <SingleDatePicker
                                placeholder="From Date"
                                triggerClassName="h-9 sm:w-36  min-w-24 w-full sm:pl-2 pl-1 rounded-xl bg-light-alpha-white"
                                value={localFromDate || null}
                                onChange={(value: any) =>
                                    setLocalFromDate(value || "")
                                }
                            />
                            <div className="h-[2px] w-3 bg-light-stroke-beta -mx-1" />
                            <SingleDatePicker
                                placeholder="To Date"
                                triggerClassName="h-9 sm:w-36 min-w-24 w-full sm:pl-2 pl-1 rounded-xl bg-light-alpha-white"
                                value={localToDate || null}
                                onChange={(value: any) =>
                                    setLocalToDate(value || "")
                                }
                            />
                            <div className="relative">
                                <button
                                    onClick={handleDateSearch}
                                    className="md:size-10 size-9  rounded-xl !p-1 bg-light-emerald-base  flex items-center justify-center"
                                    type="button">
                                    <LuSearch className="text-light-alpha-white text-xl" />
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center sm:gap-2.5 gap-1.5">
                        {onFilter && <FilterButton onClick={onFilter} />}

                        {onReset && <ResetButton onClick={onReset} />}
                    </div>
                </div>
                <div className="w-full mt-2.5">{children}</div>
                <div className="flex items-center sm:gap-2.5 gap-1.5 mt-2.5">
                    {showSearch && (
                        /* Search field */
                        <div className="relative flex items-center w-full">
                            <input
                                type="text"
                                value={localSearchValue}
                                onChange={handleLocalSearch}
                                placeholder={placeholder || "Search here..."}
                                className="h-9 px-4 py-3.5 bg-transparent rounded-xl border-[1.5px] border-light-stroke-beta md:text-sm text-xs focus:outline-none focus:border-light-emerald-base lg:w-64 !w-full placeholder:text-light-beta font-medium text-light-alpha"
                            />
                            <Search className="absolute right-3 text-light-emerald-dark size-4" />
                        </div>
                    )}

                    {showExport && (
                        <FileExportSelect
                            value={queryParams.export_as}
                            onChange={(value) =>
                                setQueryParams((prev: any) => ({
                                    ...prev,
                                    export_as: value,
                                }))
                            }
                            downloadUrl={downloadUrl}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
