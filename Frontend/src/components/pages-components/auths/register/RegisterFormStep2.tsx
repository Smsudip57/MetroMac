import React from "react";
import { useFormContext } from "react-hook-form";
import AuthInputField from "./form-field/AuthInputField";
import AuthFileUploader from "./form-field/AuthFileUploader";
import { RegisterFormData } from "./Register";

interface RegisterFormStep2Props {
  onPrevious: () => void;
  onFinalSubmit: (data: RegisterFormData) => void;
  isLoading?: boolean;
}

// File validation helper with 5MB limit
const validateFile = (file: File | undefined): true | string => {
  if (!file) return "File is required";

  const validTypes = ["image/jpeg", "image/png", "application/pdf"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type))
    return "Only PNG/PDF/JPEG files are supported";

  if (file.size > maxSize) return "File size must be less than 5MB";

  return true;
};

const RegisterFormStep2: React.FC<RegisterFormStep2Props> = ({
  onPrevious,
  onFinalSubmit,
  isLoading,
}) => {
  // Use parent form context
  const methods = useFormContext<RegisterFormData>();

  const handleFileUpload =
    (fieldName: keyof RegisterFormData) => (files: File[]) => {
      if (files.length > 0) {
        const file = files[0];
        const validation = validateFile(file);

        if (validation === true) {
          methods.setValue(fieldName, file, {
            shouldValidate: true,
          });
        } else {
          methods.setError(fieldName, {
            type: "manual",
            message: validation,
          });
        }
      }
    };

  const handleFileRemove = (fieldName: keyof RegisterFormData) => () => {
    methods.setValue(fieldName, undefined, {
      shouldValidate: true,
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger validation for step 2 fields only
    const step2Fields: (keyof RegisterFormData)[] = [
      "password",
      "confirmPassword",
      "nid_photo",
      "nid_back",
      "trade_license",
    ];

    const isValid = await methods.trigger(step2Fields);

    if (isValid) {
      const formData = methods.getValues();
      onFinalSubmit(formData);
    }
  };

  // const password = methods.watch("password");
  // const confirmPassword = methods.watch("confirmPassword");

  // useEffect(() => {
  //     if (confirmPassword && password !== confirmPassword) {
  //         methods.setError("confirmPassword", {
  //             type: "manual",
  //             message: "Passwords do not match",
  //         });
  //     } else methods.clearErrors("confirmPassword");
  // }, [password, confirmPassword]);

  return (
    <form onSubmit={onSubmit}>
      <div className="text_highlight-alpha text-xl capitalize leading-normal mb-2">
        Password
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
        <AuthInputField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter password"
        />
        <AuthInputField
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Enter password again"
        />
      </div>

      <div className="text_highlight-alpha text-xl capitalize leading-normal mb-4 mt-10">
        Required Documents
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-4 md:gap-y-8 gap-y-6">
        <AuthFileUploader
          label="NID Front"
          onImageUpload={handleFileUpload("nid_photo")}
          onImageRemove={handleFileRemove("nid_photo")}
          uploadedImages={
            methods.watch("nid_photo")
              ? [methods.watch("nid_photo") as File]
              : []
          }
          error={methods.formState.errors.nid_photo?.message}
          acceptPDF
        />
        <AuthFileUploader
          label="NID Back"
          onImageUpload={handleFileUpload("nid_back")}
          onImageRemove={handleFileRemove("nid_back")}
          uploadedImages={
            methods.watch("nid_back") ? [methods.watch("nid_back") as File] : []
          }
          error={methods.formState.errors.nid_back?.message}
          acceptPDF
        />
        <AuthFileUploader
          label="Trade License (Mandatory)"
          onImageUpload={handleFileUpload("trade_license")}
          onImageRemove={handleFileRemove("trade_license")}
          uploadedImages={
            methods.watch("trade_license")
              ? [methods.watch("trade_license") as File]
              : []
          }
          error={methods.formState.errors.trade_license?.message}
          acceptPDF
        />
        <AuthFileUploader
          label="Civil Aviation Copy"
          onImageUpload={handleFileUpload("civilaviation_copy")}
          onImageRemove={handleFileRemove("civilaviation_copy")}
          uploadedImages={
            methods.watch("civilaviation_copy")
              ? [methods.watch("civilaviation_copy") as File]
              : []
          }
          error={methods.formState.errors.civilaviation_copy?.message}
          acceptPDF
        />
        <AuthFileUploader
          label="TIN Certificate"
          onImageUpload={handleFileUpload("tin_certificate")}
          onImageRemove={handleFileRemove("tin_certificate")}
          uploadedImages={
            methods.watch("tin_certificate")
              ? [methods.watch("tin_certificate") as File]
              : []
          }
          error={methods.formState.errors.tin_certificate?.message}
          acceptPDF
        />
        <AuthFileUploader
          label="Additional Documents"
          onImageUpload={handleFileUpload("additional_documents")}
          onImageRemove={handleFileRemove("additional_documents")}
          uploadedImages={
            methods.watch("additional_documents")
              ? [methods.watch("additional_documents") as File]
              : []
          }
          error={methods.formState.errors.additional_documents?.message}
          acceptPDF
        />
      </div>

      <div className="flex justify-center items-center gap-5 mt-14">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-dark-stroke-beta/10 blur-[50] border border-dark-stroke-beta/60 h-11 text-lg w-64 rounded-xl text-white px-4 py-2 font-semibold"
        >
          Previous
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-l h-11 text-lg w-64 rounded-xl to-[#1DD0CF] from-[#209D9C] text-white px-4 py-2 font-semibold disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Next"}
        </button>
      </div>
    </form>
  );
};

export default RegisterFormStep2;
