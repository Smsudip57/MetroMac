import React from 'react'
import { Button } from "@/components/ui/button";

export default function Footer({
  methods,
  onSubmit,
  onCancel,
  children,
  disabled,
  isLoading,
  editMode,
  submitButtonText,
  loadingText,
}: {
  methods: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  editMode?: boolean;
  submitButtonText?: string;
  loadingText?: string;
}) {
  return (
    <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="w-full h-full flex flex-col"
        >
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-6 px-2">
            {children}
          </div>

          {/* Fixed Footer */}
          <div className="flex justify-end items-center gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={disabled}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={disabled}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  {loadingText || (editMode ? "Updating..." : "Creating...")}
                </span>
              ) : editMode ? (
                submitButtonText || "Update"
              ) : (
                submitButtonText || "Create"
              )}
            </Button>
          </div>
        </form>
  )
}
