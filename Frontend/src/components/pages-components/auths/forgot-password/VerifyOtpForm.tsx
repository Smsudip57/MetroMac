"use client";
import { handleError } from "@/helpers/ErrorHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

const VerifyOtpForm = ({
  email,
  onVerified,
  isVerifying,
  hasError,
  onTyping,
}: {
  email: string;
  onVerified: (otp: string) => void;
  isVerifying: boolean;
  hasError: boolean;
  onTyping: () => void;
}) => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(600); // 10 minutes = 600 seconds
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

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const updateOtp = () => {
    const val = inputRefs.current.map((el) => el?.value || "").join("");
    setOtp(val);
    setValue("otp", val);

    // Clear errors and call onTyping when user starts typing
    if (val.length > 0) {
      onTyping();
      clearErrors("otp");
    }
  };

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    if (val.length > 1) val = val.slice(-1);
    inputRefs.current[i]!.value = val;
    updateOtp();
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
      updateOtp();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    pasted.split("").forEach((char, i) => {
      if (inputRefs.current[i]) {
        inputRefs.current[i]!.value = char;
      }
    });
    updateOtp();
    const next = Math.min(pasted.length, 5);
    inputRefs.current[next]?.focus();
  };

  const [isResending, setIsResending] = useState(false);

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      setCountdown(600); // Reset to 10 minutes
      toast.success("Code resent successfully");
    } catch (error) {
      handleError(error);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const onSubmit = (data: OtpFormData) => {
    onVerified(data.otp);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="lg:w-[450px] sm:w-[400px] w-full p-7 bg-gradient-to-br from-[#13f0ee]/0 to-white/10 rounded-xl
      border border-white/30 backdrop-blur-[20.8px] flex flex-col justify-between"
    >
      <h1 className="text_highlight-alpha text-xl font-semibold text-center mb-2">
        Forgot Password? Let&apos;s change it (2/3)
      </h1>

      <p className="text_highlight-beta text-sm text-center mb-8">
        Kindly enter the verification code sent to your email.
      </p>

      <div className="flex justify-center gap-2 mb-4">
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              if (el) {
                inputRefs.current[i] = el;
              }
            }}
            maxLength={1}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-12 h-14 text-center text-lg rounded bg-transparent border text-white ${hasError || errors.otp
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
        className="w-[70%] mt-6 mx-auto text-lg bg-dark-emerald-lighter text-black font-semibold py-2.5 rounded-xl text_highlight-alpha hover:opacity-90 transition disabled:opacity-50"
      >
        {isVerifying ? "Verifying..." : "Verify"}
      </button>

      <button
        type="button"
        onClick={handleResendCode}
        disabled={countdown > 0 || isResending}
        className="text-sm text_highlight-emerald-lightest text-center font-semibold mt-4 disabled:opacity-50"
      >
        {countdown > 0
          ? `Resend in ${formatTime(countdown)}`
          : isResending
            ? "Resending..."
            : "Resend Code"}
      </button>
    </form>
  );
};

export default VerifyOtpForm;
