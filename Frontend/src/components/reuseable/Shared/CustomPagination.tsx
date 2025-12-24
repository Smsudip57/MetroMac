import {ChevronLeft, ChevronRight} from "lucide-react";
import React from "react";

interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    // Generate page numbers to display based on the dot pagination logic
    const getPageNumbersToDisplay = () => {
        // If total pages are 10 or less, show all pages
        if (totalPages <= 10)
            return Array.from({length: totalPages}, (_, i) => i + 1);

        // For more than 10 pages, implement dot pagination
        const pageNumbers = [];

        // Always show first 3 pages
        for (let i = 1; i <= 3; i++) pageNumbers.push(i);

        // Calculate the middle range
        let middleStart = Math.max(4, currentPage - 1);
        let middleEnd = Math.min(totalPages - 3, currentPage + 1);

        // Adjust if current page is at the beginning
        if (currentPage <= 5) {
            middleStart = 4;
            middleEnd = 6;
        }

        // Adjust if current page is at the end
        if (currentPage >= totalPages - 4) {
            middleStart = totalPages - 6;
            middleEnd = totalPages - 4;
        }

        // Add hyphen if there's a gap between first 3 and middle range
        if (middleStart > 4) pageNumbers.push(-1); // Use -1 to represent a hyphen

        // Add middle range pages
        for (let i = middleStart; i <= middleEnd; i++) {
            if (i > 3 && i < totalPages - 2) {
                pageNumbers.push(i);
            }
        }

        // Add hyphen if there's a gap between middle range and last 3
        if (middleEnd < totalPages - 3) {
            pageNumbers.push(-2); // Use -2 to represent a hyphen (using different value for keying)
        }

        // Always show last 3 pages
        for (let i = totalPages - 2; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    const pageNumbers = getPageNumbersToDisplay();

    // Check if previous and next buttons should be disabled
    const isPreviousDisabled = currentPage <= 1;
    const isNextDisabled = currentPage >= totalPages;

    return (
        <div className="justify-start items-center gap-2.5 inline-flex    ">
            <div className="justify-start items-center gap-2.5 flex">
                <button
                    disabled={isPreviousDisabled}
                    className={`cursor-pointer rounded-xl p-1 md:size-8 size-7   flex justify-center items-center ${
                        isPreviousDisabled
                            ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                            : "text-white bg-light-emerald-base"
                    }`}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
                    <ChevronLeft size={20} />
                </button>
                <div className="justify-start items-start gap-3 flex">
                    {pageNumbers.map((number) => (
                        <React.Fragment key={number}>
                            {number < 0 ? (
                                <p className="md:text-lg text-sm text-light-beta font-semibold -mt-2">
                                    ...
                                </p>
                            ) : (
                                // Render page number
                                <div
                                    className={`text-right ${
                                        number === currentPage
                                            ? "text-light-alpha font-semibold"
                                            : "text-light-beta font-medium"
                                    } md:text-sm text-xs cursor-pointer`}
                                    onClick={() => onPageChange(number)}>
                                    {number}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <button
                disabled={isNextDisabled}
                className={`cursor-pointer rounded-xl p-1 md:size-8 size-7 flex justify-center items-center ${
                    isNextDisabled
                        ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                        : "text-white bg-light-emerald-base"
                }`}
                onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                }>
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default CustomPagination;
