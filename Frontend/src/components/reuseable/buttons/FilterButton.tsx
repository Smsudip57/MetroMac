import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {IoFilter} from "react-icons/io5";

const FilterButton = ({
    disabled = false,
    onClick,
}: {
    disabled?: boolean;
    onClick: () => void;
}) => {
    return (
        <div>
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <button
                            disabled={disabled}
                            onClick={onClick}
                            className="md:h-10 h-9 md:w-11 w-9  bg-light-emerald-base rounded-xl flex items-center justify-center text-white">
                            <IoFilter className="md:size-6 size-5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-white">
                        <p className="md:text-sm text-xs text-light-alpha font-semibold">
                            Filters
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default FilterButton;
