"use client";

import CopyIcon from "@/assets/svg/copy-right.svg";
import SadEmo from "@/assets/svg/mood-sad.svg";
import ResponsiveModalSheet from "@/components/modals/ResponsiveModalSheet";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ErrorModalProps {
    error: any;
    onClose?: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    const handleClose = (open: boolean) => {
        setIsOpen(open);
        if (!open && onClose) {
            onClose();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                toast.success("Request ID copied to clipboard!");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {
                toast.error("Failed to copy to clipboard");
            });
    };

    const requestId = error?.data?.requestId || "";
    const errorMessage = error?.data?.message || "An unexpected error occurred";
    const payload = error?.data?.error?.payload || {};
    const hasPayload = payload && Object.keys(payload).length > 0;

    return (
        <ResponsiveModalSheet
            open={isOpen}
            onOpenChange={handleClose}
            side="bottom"
            modalWidth="max-w-2xl"
        >
            <div className="p-5 bg-white rounded-xl flex flex-col items-start gap-3 overflow-hidden">
                <div className="w-full  flex flex-col items-center gap-7">
                    <div className="w-full flex flex-col items-center gap-6">
                        {/* Header with error icon */}
                        <div className="flex justify-center items-center gap-1">
                            <SadEmo />
                            <div className="text-red-600 text-lg font-bold capitalize">
                                oops! Something went wrong
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-center gap-5">
                            {/* Error message */}
                            <div className="w-full flex flex-col items-center gap-3">
                                <div className="text-center text-gray-600 text-lg font-semibold capitalize">
                                    &ldquo;{errorMessage}&rdquo;
                                </div>

                                {/* Payload box - only show if payload exists */}
                                {hasPayload && (
                                    <div className="w-full rounded-xl border border-gray-300 max-h-40 overflow-y-auto scrollbar-hide">
                                        <SyntaxHighlighter
                                            language="json"
                                            style={atomDark}
                                            customStyle={{
                                                margin: 0,
                                                padding: "12px",
                                                fontSize: "13px",
                                                background: "#2d2d2d",
                                                borderRadius: "12px",
                                            }}
                                            wrapLongLines={true}
                                        >
                                            {JSON.stringify(payload, null, 2)}
                                        </SyntaxHighlighter>
                                    </div>
                                )}
                            </div>

                            {/* Request ID section */}
                            <div className="w-full max-w-md flex flex-col items-center gap-4">
                                <div className="w-full text-center">
                                    <span className="text-gray-500 text-xs font-bold capitalize">
                                        if you think there is an error
                                    </span>
                                    <span className="text-gray-500 text-xs font-semibold capitalize">
                                        {" "}
                                        Kindly
                                    </span>
                                    <span className="text-gray-600 text-xs font-bold capitalize">
                                        {" "}
                                        Copy the Request ID{" "}
                                    </span>
                                    <span className="text-gray-500 text-xs font-semibold capitalize">
                                        from below and contact the support
                                        person.
                                    </span>
                                </div>

                                {/* Request ID with copy button */}
                                <div className="flex items-center gap-3">
                                    <div className="px-16 py-2.5 rounded-lg border-2 border-dashed border-gray-400 flex justify-center items-center h-10">
                                        <div className="text-gray-600 text-sm font-semibold capitalize">
                                            {requestId}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            copyToClipboard(requestId);
                                        }}
                                        className="h-10 w-10 bg-light-emerald-base rounded-lg flex justify-center items-center hover:bg-light-emerald-base/70 transition-colors"
                                        title={
                                            copied
                                                ? "Copied!"
                                                : "Copy to clipboard"
                                        }
                                    >
                                        <CopyIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => handleClose(false)}
                        className={cn(
                            "w-[136px] h-10 p-4 rounded-lg border justify-center items-center gap-2.5 inline-flex",
                            "focus:outline-none focus:ring-2 focus:ring-opacity-50",
                            "transition-colors duration-200 group",
                            "border-light-emerald-base text-light-emerald-base hover:bg-light-emerald-base hover:text-white border-2 "
                        )}

                        // className="border-[#78003B] text-[#78003B] hover:bg-[#78003B] hover:text-white border-2 w-[180px] h-[36px]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </ResponsiveModalSheet>
    );
};

export default ErrorModal;
