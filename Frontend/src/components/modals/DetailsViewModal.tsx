"use client";

import {Dialog, DialogContent} from "@/components/ui/dialog";
import {Sheet, SheetContent} from "@/components/ui/sheet";
import {useMediaQuery} from "@/hooks/useMediaQuery";
import {cn} from "@/lib/utils";
import {RxCross2} from "react-icons/rx";

interface DetailsViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
    side?: "top" | "bottom" | "left" | "right";
    sheetSize?: "sm" | "md" | "lg" | "xl" | "full";
    sheetHeight?: string;
    modalWidth?: string;
}

const DetailsViewModal = ({
    open,
    onOpenChange,
    title,
    children,
    className,
    side = "top",
    sheetSize = "full",
    sheetHeight = "80vh",
    modalWidth,
}: DetailsViewModalProps) => {
    const isDesktop = useMediaQuery("(min-width: 1020px)");

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        full: "max-w-full",
    };

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
                <DialogContent
                    className={cn(
                        className,
                        "w-full !p-0 !rounded-2xl !border-none !shadow-none",
                        modalWidth ? "" : "max-w-[870px] ",
                        " overflow-y-visible max-h-[88vh] "
                    )}
                    style={modalWidth ? {maxWidth: modalWidth} : {}}>
                    {title && (
                        <div className="w-full capitalize bg-light-emerald-base h-16 rounded-t-2xl  text-white  px-5 flex justify-between pt-3">
                            <span className="text-base font-bold">{title}</span>
                            <RxCross2
                                className="size-5 font-bold cursor-pointer"
                                onClick={() => onOpenChange(false)}
                            />
                        </div>
                    )}
                    <div
                        className={cn(
                            "relative px-5 pb-6 w-full rounded-2xl  bg-white -mt-9",
                            !title ? "pt-6" : "pt-6"
                        )}>
                        {children}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={side}
                className={cn(
                    sizeClasses[sheetSize],
                    className,
                    "z-[999999999]",
                    "!p-0 !bg-white",
                    side === "bottom" && "rounded-t-[24px]"
                )}>
                {/* Top Bar - Dark teal header like FilterSheetSm */}
                {title && (
                    <div
                        className={cn(
                            "flex items-center justify-between p-4 bg-light-emerald-base",
                            side === "bottom" && "rounded-t-[24px]",
                            "-mt-1"
                        )}>
                        <p className="text-white font-semibold text-sm capitalize">
                            {title}
                        </p>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-light-alpha-white cursor-pointer"
                            aria-label="Close sheet">
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M18 6L6 18M6 6L18 18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content area */}
                <div
                    className={cn(
                        "flex flex-col flex-grow overflow-hidden",
                        title ? "px-2" : "p-5"
                    )}>
                    <div
                        className={cn(
                            "overflow-y-auto py-4",
                            title ? "flex-grow" : "pr-5"
                        )}
                        style={sheetHeight ? {maxHeight: sheetHeight} : {}}>
                        {children}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default DetailsViewModal;
