import React from "react";

interface CustomPageLimitProps {
    options: number[];
    value: number;
    onChange: (value: number) => void;
}

const CustomPageLimit: React.FC<CustomPageLimitProps> = ({
    options,
    value,
    onChange,
}) => {
    return (
        <div className="justify-start sm:items-center gap-[13px] sm:inline-flex ">
            <div className="sm:text-right text-light-alpha font-semibold md:text-sm text-xs sm:mb-0 mb-1.5">
                Rows per page
            </div>
            <div className="justify-start items-start gap-2 flex">
                {options.map((option) => (
                    <div
                        key={option}
                        className={`md:h-8 h-7 md:min-w-8 min-w-7 md:p-1.5 p-1 rounded-xl  ${
                            option === value
                                ? "dark:bg-primary/50 bg-primary text-white"
                                : "border border-border text-text"
                        } flex-col justify-center items-center gap-2.5 inline-flex cursor-pointer`}
                        onClick={() => onChange(option)}>
                        <div className="font-semibold md:text-sm text-xs">
                            {option}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomPageLimit;
