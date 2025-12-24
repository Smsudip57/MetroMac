"use client";
import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IoIosLink } from "react-icons/io";

interface FileUploadInputProps {
  label: string;
  name: string;
  accept?: string;
  maxSize?: number; // in MB
  required?: boolean;
  error?: string;
  value?: string; // URL or filename
  onFileSelect: (file: File | null) => void;
  onFileRemove: () => void;
  isUploading?: boolean;
  className?: string;
  triggerClassName?: string;
  buttonClassName?: string;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({
  label,
  name,
  accept = ".jpg,.jpeg,.png,.pdf",
  maxSize = 5,
  required = false,
  error,
  value,
  onFileSelect,
  onFileRemove,
  isUploading = false,
  className = "",
  triggerClassName = "",
  buttonClassName = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileName = () => {
    if (value) {
      // If it's a URL, extract filename or show generic name
      if (value.startsWith("http")) {
        const fileName = value.split("/").pop();
        return fileName && fileName.includes(".") ? fileName : "Uploaded file";
      }
      // If it's a blob URL (temporary), show processing status
      if (value.startsWith("blob:")) {
        return "Processing...";
      }
      // If it's already a filename
      return value;
    }
    return null;
  };

  return (
    <div className={`space-y-2 ${className} font-medium`}>
      <label className="block text-xs md:text-sm font-semibold text-light-alpha">
        {label}
        {required && <span className="text_highlight-warning-red ml-1">*</span>}
        <span className="text-gray-500 font-normal ml-1 text-xs md:text-sm">
          (Max: {maxSize}MB ; Jpg/PNG/PDF Allowed)
        </span>
      </label>

      <div className="flex gap-2">
        {/* File display/input area */}
        <div
          className={`flex-1 items-center border-2 border-dashed rounded-lg p-2 transition-colors ${triggerClassName} ${dragActive
              ? "border-light-emerald-base bg-light-emerald-base/5"
              : error
                ? "border-dark-warning-red"
                : "border-light-stroke-alpha"
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {getFileName() ? (
            <div className={`flex items-center justify-between `}>
              <span className="text-xs md:text-sm  text-light-alpha truncate mr-2 line-clamp-1">
                {getFileName()}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove();
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="flex-shrink-0 size-5 bg-light-emerald-base text-white rounded flex items-center justify-center"
                disabled={isUploading}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div
              className={`cursor-pointer flex items-center`}
              onClick={openFileDialog}
            >
              <span className="text-xs md:text-sm text-light-alpha">
                {isUploading ? "Uploading..." : "Choose file"}
              </span>
            </div>
          )}
        </div>

        {/* Upload button */}
        <Button
          type="button"
          onClick={openFileDialog}
          disabled={isUploading}
          className={buttonClassName + " flex items-center gap-2"}
        >
          <IoIosLink size={16} />
          Upload
        </Button>
      </div>

      {error && (
        <p className="text_highlight-warning-red mt-1 md:text-sm text-xs">
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        name={name}
      />
    </div>
  );
};

export default FileUploadInput;
