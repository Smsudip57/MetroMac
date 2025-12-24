"use client";
import { cn } from "@/lib/utils";
import { Upload, X, User2 } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { fieldContainerStyles, labelStyles } from "./FieldWrapper";
import { useUploadFileMutation } from "@/redux/api/files/fileApi";
import toast from "react-hot-toast";

type FormPhotoUploadMode = "upload-string" | "file-out";

interface FormPhotoUploadHFProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  onImageUpload: (files: File[] | string[] | File | string | null) => void;
  uploadedImages?: File[] | (File | null)[] | string[] | File | string | null;
  onImageRemove?: (index: number) => void;
  multiple?: boolean;
  maxPhotos?: number;
  label?: string;
  previewInside?: boolean;
  triggerText?: string | React.ReactNode;
  required?: boolean;
  description?: string;
  previewImage?: string;
  error?: string;
  disabled?: boolean;
  mode?: FormPhotoUploadMode;
  profilePicture?: boolean;
  placeholder?: string;
}

const FormPhotoUploadHF: React.FC<FormPhotoUploadHFProps> = ({
  className,
  onImageUpload,
  uploadedImages = [],
  onImageRemove,
  multiple = false,
  maxPhotos = Infinity,
  label,
  previewInside = false,
  triggerText = "Upload Photo",
  required = false,
  description,
  previewImage,
  error,
  disabled = false,
  mode = "file-out",
  profilePicture = false,
  placeholder = "Upload Image",
  ...props
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentImageRemoved, setCurrentImageRemoved] = useState(false);
  const [uploadMutation] = useUploadFileMutation();

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const response = await uploadMutation(file).unwrap();
        const fileUrl =
          response?.data?.url || response?.data?.fileUrl || response?.fileUrl;
        if (fileUrl) {
          uploadedUrls.push(fileUrl);
        } else {
          toast.error("Failed to get file URL from upload");
        }
      }

      if (uploadedUrls.length > 0) {
        if (profilePicture) {
          onImageUpload(uploadedUrls[0]);
        } else {
          onImageUpload(uploadedUrls);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const selectedFiles = Array.from(files);

      if (profilePicture) {
        // Profile picture mode - single file
        const file = selectedFiles[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);

          if (mode === "upload-string") {
            handleFileUpload([file]);
          } else {
            onImageUpload(file);
          }
        }
      } else {
        // Multiple photos mode
        const allowedFiles = selectedFiles.slice(
          0,
          maxPhotos -
            (Array.isArray(uploadedImages) ? uploadedImages.length : 0)
        );

        if (mode === "upload-string") {
          handleFileUpload(allowedFiles);
        } else {
          onImageUpload(allowedFiles as any);
        }
      }
    }
    event.target.value = "";
  };

  const handleRemove = () => {
    if (previewImage && displayImage === previewImage) {
      onImageUpload(null);
      setCurrentImageRemoved(true);
    } else {
      onImageUpload(null);
    }
    setPreview(null);
  };

  // Profile picture display logic
  const displayImage =
    preview ||
    (typeof uploadedImages === "string" ? uploadedImages : null) ||
    (currentImageRemoved ? null : previewImage);

  const hasImage = !!displayImage;

  // Multiple photos display logic
  const remainingSlots = Math.max(
    0,
    maxPhotos - (Array.isArray(uploadedImages) ? uploadedImages.length : 0)
  );
  const selectedCount = Array.isArray(uploadedImages)
    ? uploadedImages.filter(Boolean).length
    : 0;
  const hasImagesMulti =
    (Array.isArray(uploadedImages) && uploadedImages.length > 0) ||
    previewImage;

  const renderFilePreview = (file: File | null | string, index: number) => {
    if (!file) return null;

    if (typeof file === "string") {
      return (
        <div key={index} className="relative">
          {file.startsWith("http://") ||
          file.startsWith("https://") ||
          file.startsWith("data:") ? (
            <Image
              src={file}
              alt={`Preview ${index + 1}`}
              width={80}
              height={80}
              className="w-20 h-20 object-cover rounded-lg"
            />
          ) : (
            <div className="w-20 h-20 bg-ui-card flex items-center justify-center rounded-lg">
              <span className="text-xs text-text-muted">Invalid</span>
            </div>
          )}
          {!disabled && (
            <button
              type="button"
              onClick={() => onImageRemove?.(index)}
              className="absolute -top-2 -right-2 bg-brand-500 rounded-full p-1 hover:bg-brand-600 transition-colors"
            >
              <X className="w-3 h-3 text-ui-background" />
            </button>
          )}
        </div>
      );
    }

    if (file instanceof File) {
      return (
        <div key={index} className="relative">
          <Image
            src={URL.createObjectURL(file)}
            alt={`Selected ${index + 1}`}
            width={80}
            height={80}
            className="w-20 h-20 object-cover rounded-lg"
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => onImageRemove?.(index)}
              className="absolute -top-2 -right-2 bg-brand-500 rounded-full p-1 hover:bg-brand-600 transition-colors"
            >
              <X className="w-3 h-3 text-ui-background" />
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  // Profile Picture Mode
  if (profilePicture) {
    return (
      <div className={cn("w-full space-y-2", className)}>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {/* Label */}
        {label && (
          <label className={labelStyles}>
            {label}
            {required && <span className="text-brand-500 ml-1 mb-1.5">*</span>}
          </label>
        )}

        {/* Large Picture Upload Area */}
        <div className="px-8">
          <div
            onClick={handleClick}
            className={cn(
              "relative w-full aspect-square rounded-2xl border-2 border-dashed",
              "flex items-center justify-center cursor-pointer transition-all",
              "bg-ui-surface hover:bg-ui-card ",
              className,
              error
                ? "border-red-600 focus:border-red-600"
                : hasImage
                ? "border-none"
                : "border-ui-border hover:border-brand-300",
              (disabled || isUploading) &&
                "opacity-50 cursor-not-allowed hover:bg-ui-surface"
            )}
          >
            {displayImage ? (
              <>
                {/* Preview Image */}
                <div className="relative w-full h-full group rounded-2xl overflow-hidden">
                  <Image
                    src={displayImage}
                    alt="Profile Preview"
                    fill
                    className="object-cover"
                  />

                  {/* Remove Button - Top Right Corner */}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                      }}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 rounded-full p-1 transition-colors z-10"
                      title="Remove image"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all rounded-2xl overflow-hidden group-hover:bg-ui-background">
                    <p className="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      {placeholder}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Empty State with User Icon */}
                <div className="flex flex-col items-center justify-center gap-3 relative w-full h-full group overflow-hidden rounded-2xl">
                  <div className="w-full p-6">
                    <User2 className="w-full h-full text-ui-border opacity-40" />
                  </div>

                  {/* Upload Text - Visible on Hover */}
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all rounded-2xl overflow-hidden group-hover:bg-ui-background">
                    <p className="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      {placeholder}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  }

  // Multiple Photos Mode
  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        multiple={multiple}
        className="hidden"
      />

      {/* Label */}
      {label && (
        <label className={labelStyles}>
          {label}
          {required && <span className="text-brand-500 ml-1">*</span>}
          {description && (
            <span className="text-text-muted text-xs font-normal ml-2">
              {description}
            </span>
          )}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          fieldContainerStyles,
          "!h-auto !p-0 !border-dashed flex items-center",
          error && "!border-red-600 focus:!border-red-600",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <button
          onClick={handleClick}
          disabled={disabled || remainingSlots === 0 || isUploading}
          type="button"
          className={cn(
            "w-full h-full px-4 py-3 flex items-center gap-2",
            "hover:bg-ui-surface transition-colors disabled:cursor-not-allowed",
            (disabled || isUploading) && "cursor-not-allowed"
          )}
          {...props}
        >
          <Upload className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-medium text-text-primary">
            {isUploading ? "Uploading..." : triggerText}
          </span>
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      {/* Image Previews */}
      {hasImagesMulti && (
        <div className="flex flex-wrap gap-3 mt-3">
          {previewImage &&
          (!Array.isArray(uploadedImages) || uploadedImages.length === 0)
            ? renderFilePreview(previewImage, 0)
            : Array.isArray(uploadedImages) &&
              uploadedImages.map((file, index) =>
                renderFilePreview(file, index)
              )}
        </div>
      )}
    </div>
  );
};

export default FormPhotoUploadHF;
