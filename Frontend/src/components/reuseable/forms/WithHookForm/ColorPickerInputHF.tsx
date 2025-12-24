import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { fieldContainerStyles, FieldLabel } from "./FieldWrapper";
import { Copy, Check } from "lucide-react";

interface ColorPickerInputHFProps {
    name: string;
    label: string;
    className?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    showPreview?: boolean;
    showCopyButton?: boolean;
}

const ColorPickerInputHF: React.FC<ColorPickerInputHFProps> = ({
    name,
    label,
    className,
    placeholder = "#3B82F6",
    required = false,
    disabled = false,
    showPreview = true,
    showCopyButton = true,
}) => {
    const { control } = useFormContext();
    const [copied, setCopied] = useState(false);

    const handleCopyToClipboard = (value: string) => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isValidHex = (hex: string): boolean => {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/.test(hex);
    };

    const rgbToHex = (r: number, g: number, b: number): string => {
        return (
            "#" +
            [r, g, b]
                .map((x) => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                })
                .join("")
                .toUpperCase()
        );
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <div className="w-full">
                    <FieldLabel htmlFor={name} required={required} error={error}>
                        {label}
                    </FieldLabel>
                    <div className="mt-1 space-y-2">
                        {/* Color Picker Row */}
                        <div className="flex items-center gap-3">
                            {/* Color Picker Input */}
                            <div className="relative group">
                                <input
                                    type="color"
                                    {...field}
                                    id={name}
                                    disabled={disabled}
                                    className={cn(
                                        "w-14 h-10 rounded-lg cursor-pointer border-2 border-border hover:border-primary transition-all",
                                        error && "border-warning hover:border-warning",
                                        className
                                    )}
                                    onChange={(e) => {
                                        field.onChange(e.target.value.toUpperCase());
                                    }}
                                />
                                <div className="absolute -bottom-8 left-0 bg-bg_shade text-text text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    Click to pick
                                </div>
                            </div>

                            {/* Hex Input */}
                            <div className="flex-1">
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder={placeholder}
                                    disabled={disabled}
                                    className={cn(
                                        fieldContainerStyles,
                                        error && "border-warning focus-visible:ring-warning",
                                        className
                                    )}
                                    onChange={(e) => {
                                        const value = e.target.value.toUpperCase();
                                        field.onChange(value);
                                    }}
                                />
                            </div>

                            {/* Copy Button */}
                            {showCopyButton && field.value && (
                                <button
                                    type="button"
                                    onClick={() => handleCopyToClipboard(field.value)}
                                    disabled={disabled || !field.value}
                                    className={cn(
                                        "h-10 px-3 rounded-lg border-2 border-border transition-all",
                                        "hover:border-primary hover:bg-primary/5",
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                        copied
                                            ? "bg-success/10 border-success text-success"
                                            : "text-text_highlight"
                                    )}
                                    title="Copy color to clipboard"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Color Preview */}
                        {showPreview && field.value && (
                            <div className="flex items-center gap-2 p-3 bg-bg_shade/50 rounded-lg border border-border">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-md border-2 border-border transition-transform hover:scale-110",
                                        isValidHex(field.value) ? "" : "opacity-50"
                                    )}
                                    style={{
                                        backgroundColor: isValidHex(field.value)
                                            ? field.value
                                            : "transparent",
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-text_highlight">Color Value</p>
                                    <p className="text-sm font-mono font-medium text-text truncate">
                                        {field.value || "No color selected"}
                                    </p>
                                </div>
                                {!isValidHex(field.value) && field.value && (
                                    <span className="text-xs text-warning font-medium">
                                        Invalid
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <p className="text-warning text-xs">
                                {Array.isArray(error) &&
                                    !error?.[0]?.toLowerCase().includes("required") &&
                                    error?.[0]}
                            </p>
                        )}

                        {/* Helper Text */}
                        {!error && (
                            <p className="text-text_highlight text-xs">
                                Enter a hex color (e.g., #3B82F6) or use the color picker
                            </p>
                        )}
                    </div>
                </div>
            )}
        />
    );
};

export default ColorPickerInputHF;
