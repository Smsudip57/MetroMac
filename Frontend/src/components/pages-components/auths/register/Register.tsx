"use client";

import { handleError } from "@/helpers/ErrorHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import RegisterAlertModal from "./RegisterAlertModal";
import RegisterFormStep1 from "./RegisterFormStep1";
import RegisterFormStep2 from "./RegisterFormStep2";
import RegisterFormStep3 from "./RegisterFormStep3";

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

// Combined schema for all form steps
const registerSchema = z
  .object({
    // Step 1 fields
    agency: z.string().min(1, "Agency name is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(11, "Phone number must be at least 11 digits"),
    address: z.string().min(1, "Address is required"),
    country: z.object({
      label: z.string().min(1, "Country is required"),
      value: z.string().min(1, "Country is required"),
    }),
    city: z.object(
      {
        label: z.string().min(1, "City is required"),
        value: z.string().min(1, "City is required"),
      },
      { required_error: "City is required" }
    ),
    postCode: z.string().min(1, "Post code is required"),

    // Step 2 fields
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must not exceed 50 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    nid_photo: z
      .instanceof(File, { message: "NID front photo is required" })
      .refine((file) => validateFile(file) === true, {
        message: validateFile as unknown as string,
      }),
    nid_back: z
      .instanceof(File, { message: "NID back photo is required" })
      .refine((file) => validateFile(file) === true, {
        message: validateFile as unknown as string,
      }),
    trade_license: z
      .instanceof(File, { message: "Trade license is required" })
      .refine((file) => validateFile(file) === true, {
        message: validateFile as unknown as string,
      }),
    civilaviation_copy: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || validateFile(file) === true, {
        message: "File must be PNG/JPEG/PDF and under 5MB",
      }),
    tin_certificate: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || validateFile(file) === true, {
        message: "File must be PNG/JPEG/PDF and under 5MB",
      }),
    additional_documents: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || validateFile(file) === true, {
        message: "File must be PNG/JPEG/PDF and under 5MB",
      }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [formStep, setFormStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  // Only show alert modal on step 2, and only once
  const [isRegisterAlertModalOpen, setIsRegisterAlertModalOpen] =
    useState(false);
  const hasShownAlertRef = useRef(false);

  useEffect(() => {
    if (formStep === 2 && !hasShownAlertRef.current) {
      setIsRegisterAlertModalOpen(true);
      hasShownAlertRef.current = true;
    }
  }, [formStep]);

  // Initialize form with default values
  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      // Step 1 defaults
      agency: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      country: {
        label: "Bangladesh",
        value: "bangladesh",
      },
      city: undefined,
      postCode: "",

      // Step 2 defaults
      password: "",
      confirmPassword: "",
      nid_photo: undefined,
      nid_back: undefined,
      trade_license: undefined,
      civilaviation_copy: undefined,
      tin_certificate: undefined,
      additional_documents: undefined,
    },
  });

  const handleNext = () => {
    if (formStep < 2) setFormStep(formStep + 1);
  };

  const handlePrevious = () => {
    if (formStep > 1) setFormStep(formStep - 1);
  };

  const handleFinalSubmit = async (formData: RegisterFormData) => {
    try {
      setIsLoading(true);
      // Create FormData object for API
      const apiFormData = new FormData();

      // Add step 1 data
      apiFormData.append("company_name", formData.agency);
      apiFormData.append("first_name", formData.firstName);
      apiFormData.append("last_name", formData.lastName);
      apiFormData.append("email", formData.email);
      apiFormData.append("phone_code", "880");
      apiFormData.append("phone", formData.phone);
      apiFormData.append("address", formData.address);
      apiFormData.append("country", formData.country.value);
      apiFormData.append("city", formData.city.value);
      apiFormData.append("post_code", formData.postCode);

      // Add step 2 data
      apiFormData.append("password", formData.password);

      // Add files
      if (formData.nid_photo instanceof File) {
        apiFormData.append("nid_front_copy", formData.nid_photo);
      }
      if (formData.nid_back instanceof File) {
        apiFormData.append("nid_back_copy", formData.nid_back);
      }
      if (formData.trade_license instanceof File) {
        apiFormData.append("trade_license_copy", formData.trade_license);
      }
      if (formData.civilaviation_copy instanceof File) {
        apiFormData.append("civilaviation_copy", formData.civilaviation_copy);
      }
      if (formData.tin_certificate instanceof File) {
        apiFormData.append("tin_copy", formData.tin_certificate);
      }
      if (formData.additional_documents instanceof File) {
        apiFormData.append(
          "additional_document",
          formData.additional_documents
        );
      }

      // Simulate API call for now
      toast.success("Registration submitted! Please verify your email.");
      setRegisteredEmail(formData.email);
      setFormStep(3); // Move to OTP verification step
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto md:mt-10">
        <div className="lg:border-2 border-dark-stroke-beta rounded-2xl lg:p-10 capitalize">
          {/* Form Header */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-10 mb-8">
            {/* Title */}
            <div className="sm:flex items-center gap-4">
              <Image
                src="/images/Union.png"
                alt="logo"
                width={85}
                height={85}
                className="lg:mb-0 mb-5"
                style={{
                  background: "none",
                  clipPath: "content-box",
                }}
              />
              <div className="w-full flex flex-col gap-1">
                <h3 className="md:text-2xl text-xl text_highlight-alpha font-semibold ">
                  Join us and lets Grow your Business together
                </h3>
                <div className="text_highlight-beta font-medium md:text-base text-sm leading-tight">
                  Fill out the forms and registered as a b2B agent
                </div>
              </div>
            </div>

            {/* Register step */}
            <div className="flex items-center gap-10">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className={`flex flex-col items-center`}>
                    <p
                      className={`${formStep >= step
                          ? "text_highlight-alpha"
                          : "text_highlight-beta"
                        }  font-bold`}
                    >
                      {step}
                    </p>
                    <div
                      className={`size-4 rounded mt-2 rotate-45 ${formStep >= step
                          ? "bg-dark-emerald-lighter"
                          : "bg-dark-emerald-dark"
                        }`}
                    ></div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Body */}
          {formStep === 1 && <RegisterFormStep1 onNext={handleNext} />}
          {formStep === 2 && (
            <RegisterFormStep2
              onPrevious={handlePrevious}
              onFinalSubmit={handleFinalSubmit}
              isLoading={isLoading}
            />
          )}
          {formStep === 3 && <RegisterFormStep3 email={registeredEmail} />}

          {/* form footer */}
          <p className="text-center text-white font-semibold mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text_highlight-emerald-lighter font-bold  hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Show alert modal only on step 2 and only once */}
      <RegisterAlertModal
        isOpen={isRegisterAlertModalOpen}
        onClose={() => setIsRegisterAlertModalOpen(false)}
      />
    </FormProvider>
  );
};

export default Register;
