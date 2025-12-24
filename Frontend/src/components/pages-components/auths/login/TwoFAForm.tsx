"use client";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

const TwoFAForm = ({
  onSubmit,
  isVerifying,
  hasError,
  onTyping,
}: {
  onSubmit: (otp: string) => void;
  isVerifying: boolean;
  hasError: boolean;
  onTyping: () => void;
}) => {
  const [otp, setOtp] = useState("");
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    clearErrors,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  // Clear fields when error occurs
  useEffect(() => {
    if (hasError) {
      // Clear all input fields
      inputRefs.current.forEach((input) => {
        if (input) {
          input.value = "";
        }
      });
      setOtp("");
      setValue("otp", "");
    }
  }, [hasError, setValue]);

  const updateOtpFromInputs = () => {
    const val = inputRefs.current.map((input) => input?.value || "").join("");
    setOtp(val);
    setValue("otp", val);

    // Clear errors and call onTyping when user starts typing
    if (val.length > 0) {
      onTyping();
      clearErrors("otp");
    }
  };

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // only digits
    if (val.length > 1) val = val[val.length - 1];

    inputRefs.current[i]!.value = val;
    updateOtpFromInputs();

    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (inputRefs.current[i]?.value) {
        inputRefs.current[i]!.value = "";
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus();
        inputRefs.current[i - 1]!.value = "";
      }
      updateOtpFromInputs();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    pasted.split("").forEach((char, idx) => {
      if (inputRefs.current[idx]) {
        inputRefs.current[idx]!.value = char;
      }
    });
    updateOtpFromInputs();

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const onSubmitForm = (data: OtpFormData) => {
    onSubmit(data.otp);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="lg:w-[450px] sm:w-[400px] w-full p-7 bg-gradient-to-br from-[#13f0ee]/0 to-white/10 rounded-xl
border border-white/30 backdrop-blur-[20.8px] flex flex-col justify-between"
    >
      <h1 className="text-white text-xl font-semibold text-center mb-9">
        Welcome to <span className="font-bold italic text-4xl">Flight24</span>
        <span className="align-bottom">.co</span>
      </h1>

      <p className="text-center text-white mb-6">
        Enter the 6-digit code from your <br /> Authenticator App.
      </p>

      <div className="flex justify-center gap-2 mb-4">
        {[...Array(6)].map((_, idx) => (
          <input
            key={idx}
            ref={(el) => {
              if (el) inputRefs.current[idx] = el;
            }}
            maxLength={1}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={`w-12 h-14 text-center text-lg rounded bg-transparent border text-white ${
              hasError || errors.otp
                ? "border-red-500"
                : "border-[#CCCCCC] focus:border-dark-emerald-light"
            } focus:outline-none focus:ring-0`}
          />
        ))}
      </div>

      {(errors.otp || hasError) && (
        <p className="text-red-500 text-sm text-center mb-4">
          {errors.otp?.message || "Invalid OTP. Please try again."}
        </p>
      )}

      <button
        type="submit"
        disabled={isVerifying || otp.length !== 6}
        className="w-[70%] mt-4 mx-auto text-lg bg-dark-emerald-lighter text_highlight-alpha font-semibold py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
      >
        {isVerifying ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
};

export default TwoFAForm;
