"use client";
import { handleError } from "@/helpers/ErrorHandler";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import RequestResetForm from "./RequestResetForm";
import ResetPasswordForm from "./ResetPasswordForm";
import VerifyOtpForm from "./VerifyOtpForm";

type Step = "email" | "otp" | "reset";

const ForgotPassword = () => {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState(false);

    const router = useRouter();

    const handleRequestReset = async (email: string) => {
        try {
            setEmail(email);
            setStep("otp");
            toast.success("OTP sent to your email");
        } catch (error) {
            handleError(error);
            console.error("Error requesting reset:", error);
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        try {
            setOtpError(false);
            setOtp(otp);
            setStep("reset");
            toast.success("OTP verified");
        } catch (error) {
            setOtpError(true);
            handleError(error);
        }
    };

    const handleResetPassword = async (values: {
        password: string;
        confirm: string;
    }) => {
        try {
            toast.success("Password reset successful");
            router.push("/login");
        } catch (error) {
            handleError(error);
        }
    };

    const handleOtpTyping = () => {
        if (otpError) {
            setOtpError(false);
        }
    };

    return (
        <div className="max-w-7xl container mx-auto w-full">
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-10 my-32 lg:my-40">
                <div className="sm:flex hidden flex-col items-start justify-center w-full">
                    <h1 className="text-white lg:text-6xl md:text-5xl text-4xl  font-bold pb-8 border-b-2 border-light-stroke-beta w-full">
                        Travel{" "}
                        <span className="font-light italic">Anywhere</span>{" "}
                        <br /> Anytime
                    </h1>
                    <p className="text-white md:text-base text-sm pt-6">
                        Our B2B portal streamlines business operations by
                        connecting buyers and suppliers seamlessly. It offers
                        secure transactions, real-time communication, and access
                        to a global network of trusted partners.
                    </p>
                </div>

                <div className="flex items-center lg:justify-end justify-center">
                    {step === "email" && (
                        <RequestResetForm
                            onRequestReset={handleRequestReset}
                            isSending={false}
                        />
                    )}
                    {step === "otp" && (
                        <VerifyOtpForm
                            email={email}
                            onVerified={handleVerifyOtp}
                            isVerifying={false}
                            hasError={otpError}
                            onTyping={handleOtpTyping}
                        />
                    )}
                    {step === "reset" && (
                        <ResetPasswordForm
                            onDone={handleResetPassword}
                            isResettingPassword={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
