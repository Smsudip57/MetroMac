"use client";

import ErrorModal from "@/components/reuseable/Shared/ErrorModal";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Global state for error handling
let errorHandlerInstance: {
    showError: (error: any) => void;
} | null = null;

export const handleError = (
    error: any,
    defaultMessage = "An unexpected error occurred!"
) => {
    // Handle 403 Forbidden errors specifically
    if (error?.status === 403 || error?.data?.statusCode === 403) {
        toast.error(
            "Access denied. You don't have permission to perform this action."
        );

        // Redirect to unauthorized page after a short delay
        setTimeout(() => {
            if (typeof window !== "undefined") {
                window.location.href = "/unauthorized";
            }
        }, 2000);

        return "Access denied. You don't have permission to perform this action.";
    }

    // Show error modal using React state
    if (errorHandlerInstance) {
        errorHandlerInstance.showError(error);
    }

    const errorMessage = error?.data?.message || defaultMessage;
    let payloadErrorMessage;

    // Handle validation errors or payload errors
    if (error?.data?.error?.payload) {
        if (typeof error.data.error.payload === "object") {
            payloadErrorMessage = Object.values(error.data.error.payload).join(
                "\n"
            );
        }
    }

    return payloadErrorMessage || errorMessage;
};

// React component for handling errors
export const ErrorHandler: React.FC = () => {
    const [currentError, setCurrentError] = useState<any>(null);

    useEffect(() => {
        // Register this component instance globally
        errorHandlerInstance = {
            showError: (error: any) => {
                setCurrentError(error);
            },
        };

        // Cleanup on unmount
        return () => {
            errorHandlerInstance = null;
        };
    }, []);

    const handleModalClose = () => {
        setCurrentError(null);
    };

    // Return the ErrorModal only when there's an error
    if (!currentError) return null;

    return <ErrorModal error={currentError} onClose={handleModalClose} />;
};
