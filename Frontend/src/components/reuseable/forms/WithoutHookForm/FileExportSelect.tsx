import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {fileExportOptions} from "@/constants/shared";
import {cn} from "@/lib/utils";
import {ChevronDown, Download} from "lucide-react";
import {useEffect, useState} from "react";

interface FormSelectProps {
    value?: string;
    placeholder?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    downloadUrl?: string;
}

const FileExportSelect: React.FC<FormSelectProps> = ({
    value,
    placeholder = "Select file type",
    defaultValue,
    onChange,
    disabled = false,
    downloadUrl,
}) => {
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultValue || "");

    const handleValueChange = (newValue: string) => {
        setSelectedValue(newValue);
        onChange?.(newValue);
        setOpen(false);
    };

    useEffect(() => {
        if (value) setSelectedValue(value);
        else setSelectedValue(defaultValue || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <div className="flex max-w-40 items-center gap-2 md:h-10 h-9  pr-1  bg-transparent rounded-xl border-[1.5px] border-light-stroke-beta text-sm focus:outline-none focus:border-light-emerald-base w-64">
            <Select
                open={open}
                onOpenChange={setOpen}
                onValueChange={handleValueChange}
                value={selectedValue || ""}
                disabled={disabled}>
                <SelectTrigger
                    className={cn(
                        "w-full border-none  !pr-2 flex items-center justify-between sm:!text-sm !text-xs"
                    )}>
                    <SelectValue
                        placeholder={placeholder}
                        className="text-light-beta !font-medium"
                    />
                    <ChevronDown className="text-light-alpha size-7 border-r border-light-stroke-beta pr-1" />
                </SelectTrigger>
                <SelectContent className="bg-light-alpha-white shadow-[0px_12px_48px_0px_rgba(85,153,153,0.16)] border-none">
                    {fileExportOptions.map((option) => (
                        <SelectItem
                            key={option.slug}
                            value={option.slug}
                            className="cursor-pointer text-light-alpha font-semibold hover:bg-light-emerald-light/10 sm:!text-sm !text-xs !rounded-lg !px-2">
                            {option.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <button disabled={!downloadUrl}>
                <a
                    href={downloadUrl}
                    target="_blank"
                    download
                    className="md:h-8 h-7 w-8 bg-light-emerald-base rounded-lg flex items-center justify-center">
                    <Download className="text-light-alpha-white size-5" />
                </a>
            </button>
        </div>
    );
};

export default FileExportSelect;
