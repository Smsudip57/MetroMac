"use client";
import React, { useEffect, useState } from "react";
import NextImage from "next/image";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";
import FormInputHF from "@/components/reuseable/forms/WithHookForm/FormInputHF";
import FormSelectHF from "@/components/reuseable/forms/WithHookForm/FormSelectHF";
import FormPhotoUploadHF from "@/components/reuseable/forms/WithHookForm/FormPhotoUploadHF";
import { Button } from "@/components/ui/button";
import {
  useGetGeneralSettingsQuery,
  useUpdateGeneralSettingsMutation,
} from "@/redux/api/settings/generalsettings/generalSettingsApi";
import { useUploadFileMutation } from "@/redux/api/files/fileApi";
import WindowForm from "@/components/reuseable/forms/WindowForm/WindowForm";
import { useSmartFileUpload } from "@/hooks/useSmartFileUpload";
import { Edit2 } from "lucide-react";

// Validation schema
const generalSettingsSchema = z
  .object({
    company_name: z.string().optional().nullable(),
    company_logo: z.string().optional().nullable(),
    company_icon: z.string().optional().nullable(),
    company_phone: z.string().optional().nullable(),
    company_trn: z.string().optional().nullable(),
    company_address: z.string().optional().nullable(),
    default_currency: z
      .string()
      .regex(
        /^[A-Z]{3}$/,
        "Currency must be 3 uppercase letters (e.g., USD, EUR)"
      ),
    currency_sign: z.string().min(1, "Currency sign cannot be empty"),
    file_storage_type: z.enum(["local", "amazon_s3", "cloudinary"]),
    api_key: z.string().optional().nullable(),
    amazon_s3_access_key: z.string().optional().nullable(),
    amazon_s3_secret_key: z.string().optional().nullable(),
    amazon_s3_bucket: z.string().optional().nullable(),
    amazon_s3_region: z.string().optional().nullable(),
    cloudinary_cloud_name: z.string().optional().nullable(),
    cloudinary_api_key: z.string().optional().nullable(),
    cloudinary_api_secret: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // API key is required for non-local storage
      if (data.file_storage_type !== "local" && !data.api_key) {
        return false;
      }
      return true;
    },
    {
      message: "API key is required for non-local storage",
      path: ["api_key"],
    }
  );

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

// Helper function to validate icon dimensions (1:1 ratio with 10% tolerance)
const validateIconDimensions = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const ratio = width / height;
        // 1:1 ratio is 1.0, allow 10% tolerance (0.9 to 1.1)
        const isValid = ratio >= 0.9 && ratio <= 1.1;
        resolve(isValid);
      };
      img.onerror = () => resolve(false);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// Helper function to get image dimensions
const getImageDimensions = (
  file: File | string
): Promise<{ width: number; height: number } | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => resolve(null);
    img.src = typeof file === "string" ? file : URL.createObjectURL(file);
  });
};

// Component to display logo with responsive dimensions
function LogoImageContainer({ src }: { src: string }) {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    getImageDimensions(src).then((dims) => {
      if (dims) {
        setDimensions(dims);
      }
    });
  }, [src]);

  if (!dimensions) {
    return <div className="w-32 h-32 bg-bg_shade rounded-lg animate-pulse" />;
  }

  // Calculate aspect ratio to determine container size
  const aspectRatio = dimensions.width / dimensions.height;
  const maxWidth = 200;
  const maxHeight = 200;

  let containerWidth = maxWidth;
  let containerHeight = maxHeight;

  if (aspectRatio > 1) {
    // Wider than tall
    containerHeight = maxWidth / aspectRatio;
  } else {
    // Taller than wide
    containerWidth = maxHeight * aspectRatio;
  }

  return (
    <div
      className="bg-bg_shade rounded-lg overflow-hidden flex items-center justify-center"
      style={{ width: `${containerWidth}px`, height: `auto` }}
    >
      <NextImage
        src={src}
        alt="Company Logo"
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function GeneralSettings() {
  const [editMode, setEditMode] = useState(false);
  const [logoDimensions, setLogoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // API hooks
  const { data: settingsData, isLoading } =
    useGetGeneralSettingsQuery(undefined);
  const [updateGeneralSettings, { isLoading: isUpdating }] =
    useUpdateGeneralSettingsMutation();
  const [uploadFile] = useUploadFileMutation();

  // Smart file upload hook for logo
  const {
    uploadedImages: logoImages,
    isUploading: isLogoUploading,
    handleImageUpload: handleLogoUploadBase,
    handleImageRemove: handleLogoRemove,
    getFinalFileUrl: getLogoUrl,
    resetUploadedImages: resetLogoImages,
  } = useSmartFileUpload(
    (file) => uploadFile(file).unwrap(),
    settingsData?.data?.company_logo ? [settingsData.data.company_logo] : []
  );

  // Smart file upload hook for icon with dimension validation
  const {
    uploadedImages: iconImages,
    isUploading: isIconUploading,
    handleImageUpload: handleIconUploadBase,
    handleImageRemove: handleIconRemove,
    getFinalFileUrl: getIconUrl,
    resetUploadedImages: resetIconImages,
  } = useSmartFileUpload(
    (file) => uploadFile(file).unwrap(),
    settingsData?.data?.company_icon ? [settingsData.data.company_icon] : []
  );

  const settings = settingsData?.data;

  // Wrapper for icon upload to validate dimensions
  const handleIconUpload = (
    files: string | string[] | File | File[] | null
  ) => {
    // Filter to only File objects
    if (
      !files ||
      (Array.isArray(files) && files.length === 0) ||
      typeof files === "string"
    )
      return;

    const fileArray = Array.isArray(files) ? files : [files];
    const actualFiles = fileArray.filter((f) => f instanceof File) as File[];

    if (actualFiles.length === 0) return;

    const file = actualFiles[0];

    // Validate dimensions asynchronously
    validateIconDimensions(file).then((isValid) => {
      if (!isValid) {
        toast.error(
          "Company icon must be in 1:1 ratio (square) with 10% tolerance"
        );
        handleIconRemove(0);
        return;
      }

      // Call the base upload handler on success
      handleIconUploadBase(actualFiles);
    });
  };

  // Handler for logo upload to track dimensions
  const handleLogoUpload = (
    files: string | string[] | File | File[] | null
  ) => {
    // Normalize and filter to actual File objects
    if (
      !files ||
      (Array.isArray(files) && files.length === 0) ||
      typeof files === "string"
    )
      return;
    const fileArray = Array.isArray(files) ? files : [files];
    const actualFiles = fileArray.filter((f) => f instanceof File) as File[];
    if (actualFiles.length === 0) return;

    const file = actualFiles[0];

    // Get logo dimensions when uploaded
    getImageDimensions(file).then((dims) => {
      if (dims) {
        setLogoDimensions(dims);
      }
    });

    // Call the base upload handler
    handleLogoUploadBase(actualFiles);
  };

  const methods = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      company_name: "",
      company_logo: "",
      company_icon: "",
      company_phone: "",
      company_trn: "",
      company_address: "",
      default_currency: "USD",
      currency_sign: "$",
      file_storage_type: "local",
      api_key: "",
      amazon_s3_access_key: "",
      amazon_s3_secret_key: "",
      amazon_s3_bucket: "",
      amazon_s3_region: "",
      cloudinary_cloud_name: "",
      cloudinary_api_key: "",
      cloudinary_api_secret: "",
    },
  });

  const { reset, watch, setValue } = methods;
  const fileStorageType = watch("file_storage_type");

  // Reset form when data loads
  useEffect(() => {
    if (settings) {
      reset({
        company_name: settings.company_name || "",
        company_logo: settings.company_logo || "",
        company_icon: settings.company_icon || "",
        company_phone: settings.company_phone || "",
        company_trn: settings.company_trn || "",
        company_address: settings.company_address || "",
        default_currency: settings.default_currency || "USD",
        currency_sign: settings.currency_sign || "$",
        file_storage_type: settings.file_storage_type || "local",
        api_key: settings.api_key || "",
        amazon_s3_access_key: settings.amazon_s3_access_key || "",
        amazon_s3_secret_key: settings.amazon_s3_secret_key || "",
        amazon_s3_bucket: settings.amazon_s3_bucket || "",
        amazon_s3_region: settings.amazon_s3_region || "",
        cloudinary_cloud_name: settings.cloudinary_cloud_name || "",
        cloudinary_api_key: settings.cloudinary_api_key || "",
        cloudinary_api_secret: settings.cloudinary_api_secret || "",
      });

      // Reset uploaded images when settings load
      if (settings.company_logo) {
        resetLogoImages([settings.company_logo]);
        // Get dimensions of existing logo
        getImageDimensions(settings.company_logo).then((dims) => {
          if (dims) {
            setLogoDimensions(dims);
          }
        });
      } else {
        resetLogoImages([]);
        setLogoDimensions(null);
      }

      // Reset icon images when settings load
      if (settings.company_icon) {
        resetIconImages([settings.company_icon]);
      } else {
        resetIconImages([]);
      }
    }
  }, [settings, reset, resetLogoImages, resetIconImages]);

  // Submit handler
  const onSubmit = async (data: GeneralSettingsFormData) => {
    try {
      // Get the final file URLs (uploads if needed)
      const logoUrl = await getLogoUrl();
      const iconUrl = await getIconUrl();

      const payload = {
        ...data,
        company_logo: logoUrl,
        company_icon: iconUrl || undefined,
        company_phone: data.company_phone || undefined,
        company_trn: data.company_trn || undefined,
      };

      await updateGeneralSettings(payload).unwrap();
      toast.success("Settings updated successfully");
      setEditMode(false);
    } catch (error: any) {
      console.error("Update settings error:", error);
      toast.error(error?.data?.message || "An error occurred");
    }
  };

  const storageOptions = [
    { value: "local", label: "Local Storage" },
    { value: "amazon_s3", label: "Amazon S3" },
    { value: "cloudinary", label: "Cloudinary" },
  ];

  if (isLoading) {
    return (
      <ContainerWrapper>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ContainerWrapper>
    );
  }

  // Display Mode
  if (!editMode) {
    return (
      <ContainerWrapper>
        <div className="space-y-6">
          {/* Header with Edit Button */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-text_highlight">
                General Settings
              </h2>
              <p className="text-sm text-text">
                Manage your company information and file storage configuration
              </p>
            </div>
            <Button
              onClick={() => setEditMode(true)}
              className="gap-2"
              size="sm"
              variant="default"
            >
              <Edit2 className="w-4 h-4" />
              Edit Settings
            </Button>
          </div>

          {/* Company Information Section */}
          <div className="bg-bg rounded-lg  py-6 px-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text_highlight mb-4">
                Company Information
              </h3>
              <div className="space-y-6">
                {/* Logo and Name Together */}
                <div className="flex items-start gap-4">
                  {/* Company Icon */}
                  <div className="flex-shrink-0">
                    <label className="text-sm font-medium text-text block mb-2">
                      Company Icon
                    </label>
                    <div className="w-32 h-32 bg-bg_shade rounded-lg overflow-hidden flex items-center justify-center">
                      {settings?.company_icon ? (
                        <NextImage
                          src={settings.company_icon}
                          alt="Company Icon"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <p className="text-xs text-text opacity-50 mt-1">
                            No icon
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <label className="text-sm font-medium text-text block mb-2">
                      Company Logo
                    </label>
                    {settings?.company_logo ? (
                      <LogoImageContainer src={settings.company_logo} />
                    ) : (
                      <div className="w-32 h-32 bg-bg_shade rounded-lg overflow-hidden flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-xs text-text opacity-50 mt-1">
                            No logo
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Company Name and Currency */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text block mb-2">
                        Company Name
                      </label>
                      <p className="text-text_highlight text-base py-2 px-3 bg-bg_shade rounded-lg">
                        {settings?.company_name || "-"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-text block mb-2">
                        Default Currency
                      </label>
                      <p className="text-text_highlight text-base py-2 px-3 bg-bg_shade rounded-lg">
                        {settings?.default_currency} ({settings?.currency_sign})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Address */}
                <div>
                  <label className="text-sm font-medium text-text block mb-2">
                    Company Address
                  </label>
                  <p className="text-text_highlight text-base py-2 px-3 bg-bg_shade rounded-lg">
                    {settings?.company_address || "-"}
                  </p>
                </div>

                {/* Company Phone */}
                <div>
                  <label className="text-sm font-medium text-text block mb-2">
                    Company Phone
                  </label>
                  <p className="text-text_highlight text-base py-2 px-3 bg-bg_shade rounded-lg">
                    {settings?.company_phone || "-"}
                  </p>
                </div>

                {/* Company TRN */}
                <div>
                  <label className="text-sm font-medium text-text block mb-2">
                    TRN (Tax Registration Number)
                  </label>
                  <p className="text-text_highlight text-base py-2 px-3 bg-bg_shade rounded-lg">
                    {settings?.company_trn || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* File Storage Configuration Section */}
          <div className="bg-bg rounded-lg  py-6 px-2 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-text_highlight mb-4">
                File Storage Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Storage Type */}
                <div>
                  <label className="text-sm font-medium text-text block mb-2">
                    Storage Type
                  </label>
                  <p className="text-text_highlight text-base py-2 px-3 bg-bg_shade rounded-lg capitalize">
                    {settings?.file_storage_type || "-"}
                  </p>
                </div>

                {/* API Key */}
                <div>
                  <label className="text-sm font-medium text-text block mb-2">
                    API Key
                  </label>
                  <p className="text-text_highlight text-xs py-2 px-3 bg-bg_shade rounded-lg font-mono break-all">
                    {settings?.api_key
                      ? `${settings.api_key.substring(0, 20)}...`
                      : "-"}
                  </p>
                </div>

                {/* S3 Configuration */}
                {settings?.file_storage_type === "amazon_s3" && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-text block mb-2">
                        S3 Bucket
                      </label>
                      <p className="text-text_highlight text-base py-2 px-3 bg-bg_shade rounded-lg">
                        {settings?.amazon_s3_bucket || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text block mb-2">
                        S3 Region
                      </label>
                      <p className="text-text_highlight text-base py-2 px-3 bg-bg_shade rounded-lg">
                        {settings?.amazon_s3_region || "-"}
                      </p>
                    </div>
                  </>
                )}

                {/* Cloudinary Configuration */}
                {settings?.file_storage_type === "cloudinary" && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-text block mb-2">
                        Cloudinary Cloud Name
                      </label>
                      <p className="text-text_highlight text-base py-2 px-3 bg-bg_shade rounded-lg">
                        {settings?.cloudinary_cloud_name || "-"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </ContainerWrapper>
    );
  }

  // Edit Mode Form
  return (
    <ContainerWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-text_highlight">
            Edit General Settings
          </h2>
          <p className="text-sm text-text">
            Update your company information and file storage configuration
          </p>
        </div>

        <FormProvider {...methods}>
          <WindowForm
            methods={methods}
            onSubmit={methods.handleSubmit(onSubmit)}
            onCancel={() => {
              setEditMode(false);
              reset();
              resetLogoImages(
                settings?.company_logo ? [settings.company_logo] : []
              );
              resetIconImages(
                settings?.company_icon ? [settings.company_icon] : []
              );
            }}
            isLoading={isUpdating}
            editMode={true}
            disabled={isUpdating}
            submitButtonText="Update Settings"
            loadingText="Updating Settings..."
          >
            <div className="bg-bg rounded-lg  py-6 space-y-6">
              {/* Company Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text_highlight">
                  Company Information
                </h3>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <FormPhotoUploadHF
                      name="company_icon"
                      label="Company Icon"
                      multiple={false}
                      className="h-28 w-28"
                      previewInside={true}
                      onImageUpload={handleIconUpload}
                      uploadedImages={iconImages as (File | null)[]}
                      onImageRemove={handleIconRemove}
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="flex-shrink-0">
                    <FormPhotoUploadHF
                      name="company_logo"
                      label="Company Logo"
                      multiple={false}
                      className="h-28 w-28"
                      previewInside={true}
                      onImageUpload={handleLogoUpload}
                      uploadedImages={logoImages as (File | null)[]}
                      onImageRemove={handleLogoRemove}
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <FormInputHF
                      name="company_name"
                      label="Company Name"
                      placeholder="Enter company name"
                      disabled={isUpdating}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormInputHF
                        name="default_currency"
                        label="Currency Code"
                        placeholder="e.g., USD"
                        disabled={isUpdating}
                      />
                      <FormInputHF
                        name="currency_sign"
                        label="Currency Sign"
                        placeholder="e.g., $"
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                </div>

                <FormInputHF
                  name="company_address"
                  label="Company Address"
                  placeholder="Enter company address"
                  type="textarea"
                  disabled={isUpdating}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInputHF
                    name="company_phone"
                    label="Company Phone"
                    placeholder="Enter company phone number"
                    disabled={isUpdating}
                  />
                  <FormInputHF
                    name="company_trn"
                    label="TRN (Tax Registration Number)"
                    placeholder="Enter TRN"
                    disabled={isUpdating}
                  />
                </div>
              </div>

              {/* File Storage Configuration Section */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-text_highlight">
                  File Storage Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelectHF
                    name="file_storage_type"
                    label="Storage Type"
                    placeholder="Select storage type"
                    options={storageOptions}
                    required
                    disabled={isUpdating}
                  />

                  {fileStorageType !== "local" && (
                    <FormInputHF
                      name="api_key"
                      label="API Key"
                      placeholder="Enter API key"
                      required
                      disabled={isUpdating}
                      type="password"
                    />
                  )}
                </div>

                {/* Amazon S3 Configuration */}
                {fileStorageType === "amazon_s3" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 p-4 bg-bg rounded-lg">
                    <FormInputHF
                      name="amazon_s3_access_key"
                      label="S3 Access Key"
                      placeholder="Enter S3 access key"
                      disabled={isUpdating}
                      type="password"
                    />
                    <FormInputHF
                      name="amazon_s3_secret_key"
                      label="S3 Secret Key"
                      placeholder="Enter S3 secret key"
                      disabled={isUpdating}
                      type="password"
                    />
                    <FormInputHF
                      name="amazon_s3_bucket"
                      label="S3 Bucket"
                      placeholder="Enter S3 bucket name"
                      disabled={isUpdating}
                    />
                    <FormInputHF
                      name="amazon_s3_region"
                      label="S3 Region"
                      placeholder="e.g., us-east-1"
                      disabled={isUpdating}
                    />
                  </div>
                )}

                {/* Cloudinary Configuration */}
                {fileStorageType === "cloudinary" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 p-4 bg-bg rounded-lg">
                    <FormInputHF
                      name="cloudinary_cloud_name"
                      label="Cloud Name"
                      placeholder="Enter Cloudinary cloud name"
                      disabled={isUpdating}
                    />
                    <FormInputHF
                      name="cloudinary_api_key"
                      label="API Key"
                      placeholder="Enter Cloudinary API key"
                      disabled={isUpdating}
                      type="password"
                    />
                    <FormInputHF
                      name="cloudinary_api_secret"
                      label="API Secret"
                      placeholder="Enter Cloudinary API secret"
                      disabled={isUpdating}
                      type="password"
                    />
                  </div>
                )}
              </div>
            </div>
          </WindowForm>
        </FormProvider>
      </div>
    </ContainerWrapper>
  );
}
