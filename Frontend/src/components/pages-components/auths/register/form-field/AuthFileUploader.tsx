"use client";
import { cn } from "@/lib/utils";
import { ImAttachment, ImFilePdf } from "react-icons/im";
import Image from "next/image";
import React, { useRef } from "react";
import { X } from "lucide-react";

interface AuthFileUploaderProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  onImageUpload: (files: File[]) => void;
  uploadedFile?: File | null;
  uploadedImages?: File[];
  onImageRemove: () => void;
  label?: string;
  acceptPDF?: boolean;
  error?: string;
}

const AuthFileUploader: React.FC<AuthFileUploaderProps> = ({
  className,
  onImageUpload,
  uploadedFile,
  uploadedImages = [],
  onImageRemove,
  label,
  acceptPDF = false,
  error,
  ...props
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      onImageUpload(filesArray);
    }

    // Reset the input value to allow selecting the same file again
    event.target.value = "";
  };

  const renderFilePreview = (file: File) => {
    if (acceptPDF && file.type === "application/pdf") {
      return (
        <div className="relative -mt-3">
          <div className="w-28 h-20 rounded-lg border border-gray-200 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="relative">
              <ImFilePdf className="w-12 h-12 text-[#3a0067]" />
              <div className="absolute bottom-0 right-0 bg-[#3a0067] text-white text-[8px] px-1 rounded">
                PDF
              </div>
            </div>
            <span className="text-xs text-gray-600 mt-1 max-w-[80px] truncate">
              {file.name}
            </span>
          </div>
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute top-2 right-2 bg-white rounded-full p-0.5"
          >
            <X className="w-4 h-4 text_highlight-alpha" />
          </button>
        </div>
      );
    }

    return (
      <div className="relative -mt-3">
        <Image
          src={URL.createObjectURL(file)}
          alt="Selected file"
          width={96}
          height={96}
          className="w-28 h-20 object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={onImageRemove}
          className="absolute top-2 right-2 bg-dark-emerald-dark rounded p-0.5"
        >
          <X className="w-4 h-4 text_highlight-alpha" />
        </button>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "self-stretch flex-col justify-start items-start gap-6 flex w-full",
        className
      )}
    >
      <div className="self-stretch flex-col justify-start items-start  flex">
        <div className="self-stretch flex-col justify-start items-start flex">
          {label && (
            <div className="text_highlight-alpha text-base font-medium">
              {label}{" "}
            </div>
          )}
        </div>
        <div className={"w-full mt-2"}>
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "h-10 w-28 px-4 bg-dark-emerald-light rounded-lg justify-center items-center gap-3 inline-flex",
                "text_highlight-alpha  font-medium"
              )}
              onClick={handleClick}
              type="button"
              disabled={!!uploadedFile || uploadedImages.length > 0}
              {...props}
            >
              <ImAttachment className="size-4" /> Upload
            </button>
            <p className="text_highlight-beta border w-full  border-dark-beta h-10 px-4 rounded-lg flex items-center">
              {uploadedFile || uploadedImages.length > 0
                ? "File selected"
                : "Choose file"}
            </p>
          </div>
        </div>
        {error && (
          <p className="text_highlight-warning-red text-sm mt-1">{error}</p>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept={acceptPDF ? "image/*,.pdf" : "image/*"}
      />

      {uploadedFile && (
        <div className="flex flex-wrap ">{renderFilePreview(uploadedFile)}</div>
      )}

      {uploadedImages.length > 0 && !uploadedFile && (
        <div className="flex flex-wrap gap-4">
          {renderFilePreview(uploadedImages[0])}
        </div>
      )}
    </div>
  );
};

export default AuthFileUploader;
