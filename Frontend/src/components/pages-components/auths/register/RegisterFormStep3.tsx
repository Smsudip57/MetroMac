import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { handleError } from "@/helpers/ErrorHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface RegisterFormStep3Props {
  email: string;
}

const RegisterFormStep3: React.FC<RegisterFormStep3Props> = ({ email }) => {
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  const methods = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: OtpFormData) => {
    try {
      setIsVerifying(true);
      toast.success("Email verified successfully!");
      router.push("/login");
    } catch (error: any) {
      handleError(error);
      // Clear the OTP input field on error
      methods.reset({ otp: "" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      toast.success("OTP resent successfully!");
      setCountdown(600); // Reset countdown to 10 minutes
      setIsResendDisabled(true);
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsResending(false);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0)
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    else setIsResendDisabled(false);

    return () => clearTimeout(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center mb-6 text_highlight-alpha">
          <p>We&apos;ve sent a 6-digit verification code to</p>
          <p className="font-semibold lowercase">{email}</p>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <Label htmlFor="otp" className="text_highlight-alpha text-base mb-1">
            Verification Code
          </Label>
          <InputOTP
            className="text_highlight-alpha"
            maxLength={6}
            value={methods.watch("otp")}
            onChange={(value) => methods.setValue("otp", value)}
          >
            <InputOTPGroup>
              <InputOTPSlot
                className="size-12 text_highlight-alpha focus:outline-dark-emerald-darker"
                index={0}
                itemType="number"
              />
              <InputOTPSlot
                className="size-12 text_highlight-alpha focus:outline-dark-emerald-darker"
                index={1}
                itemType="number"
              />
              <InputOTPSlot
                className="size-12 text_highlight-alpha focus:outline-dark-emerald-darker"
                index={2}
                itemType="number"
              />
            </InputOTPGroup>
            <InputOTPSeparator className="text_highlight-alpha" />
            <InputOTPGroup>
              <InputOTPSlot
                className="size-12 text_highlight-alpha focus:outline-dark-emerald-darker"
                index={3}
                itemType="number"
              />
              <InputOTPSlot
                className="size-12 text_highlight-alpha focus:outline-dark-emerald-darker"
                index={4}
                itemType="number"
              />
              <InputOTPSlot
                className="size-12 text_highlight-alpha focus:outline-dark-emerald-darker"
                index={5}
                itemType="number"
              />
            </InputOTPGroup>
          </InputOTP>
          {methods.formState.errors.otp && (
            <p className="text-sm text_highlight-warning-red">
              {methods.formState.errors.otp.message}
            </p>
          )}
        </div>

        <div className="flex justify-center items-center gap-2 mt-4 ">
          <p className="text-base text_highlight-alpha">
            Didn&apos;t receive code?
          </p>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto text-base text_highlight-alpha"
            onClick={handleResendOtp}
            disabled={isResendDisabled || isResending}
          >
            {isResendDisabled
              ? `Resend in ${formatTime(countdown)}`
              : "Resend OTP"}
          </Button>
        </div>

        <div className="flex justify-center items-center mt-10">
          <button
            type="submit"
            className="max-w-[280px] w-full mx-auto bg-dark-emerald-lighter text_highlight-alpha font-semibold py-2.5 text-lg rounded-xl hover:opacity-90 transition"
          >
            {isVerifying ? "Verifying..." : "Verify & Continue"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default RegisterFormStep3;
