"use client";
import { useAppDispatch } from "@/lib/hooks";
import {
  useLoginMutation,
  //   useResendVerificationEmailMutation,
  //   useVerify2FAOtpMutation,
  //   useVerifyEmailMutation,
} from "@/redux/api/authApi";
import { setToken, setUser } from "@/redux/features/authSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useGetGeneralSettingsQuery } from "@/redux/api/settings/generalsettings/generalSettingsApi";
import { useGetMeQuery } from "@/redux/api/profile/profileApi";

import { handleError } from "@/helpers/ErrorHandler";
import EmailVerificationForm from "./EmailVerificationForm";
import LoginForm, { LoginFormInputs } from "./LoginForm";
import TwoFAForm from "./TwoFAForm";

const Login = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<"login" | "email" | "2fa">("login");

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const { data: settingsData } = useGetGeneralSettingsQuery(undefined);
  const { refetch: refetchMe, isLoading: isLoadingMe } = useGetMeQuery({});
  //   const [verifyEmail, { isLoading: isVerifyingEmail }] =
  //     useVerifyEmailMutation();
  //   const [verify2FA, { isLoading: isVerifying2FA }] = useVerify2FAOtpMutation();
  //   const [resendVerificationEmail, { isLoading: isResending }] =
  //     useResendVerificationEmailMutation();

  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  //   const [tempToken, setTempToken] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [faError, setFaError] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const handleLogin = async (data: LoginFormInputs) => {
    try {
      const res = await login(data).unwrap();

      if (res.message === "Login successful") {
        setUsername(data.username);
        setRememberMe(data.remember_me || false);

        // setTempToken(token);

        //         if (!res.data.is_verified) {
        //             setStep("email");
        //             await resendVerificationEmail({
        //                 username: data.username,
        //             }).unwrap();
        //             setResendCountdown(600); // 10 minutes
        //         } else if (res.data.is_2fa_enabled) {
        //             setStep("2fa");
        //         } else {
        //             dispatch(setToken(token));
        // Cookie-based auth - no token handling needed
        toast.success("Login Successful!");

        // Refetch the user profile to trigger UserProvider redirect logic
        await refetchMe();
      }
    } catch (err: any) {
      console.log("🚀 ~ handleLogin ~ err:", err);
      handleError(err);
    }
  };

  // const handleEmailVerify = async (otp: string) => {
  //   try {
  //     setEmailError(false);
  //     const res = await verifyEmail({ otp, next_login: true }).unwrap();
  //     if (res.status === "success") {
  //       dispatch(setToken(res.data.access_token));
  //       toast.success("Email verified!");
  //       if (redirect) {
  //         const decodedRedirect = decodeURIComponent(redirect as string);
  //         router.push(decodedRedirect);
  //       } else router.push("/search-page");
  //     }
  //   } catch (err: any) {
  //     setEmailError(true);
  //     handleError(err);
  //   }
  // };

  // const handleResendEmail = async () => {
  //   try {
  //     await resendVerificationEmail({ email }).unwrap();
  //     setResendCountdown(600); // 10 minutes
  //     toast.success("Verification code resent");
  //   } catch (err) {
  //     handleError(err);
  //   }
  // };

  // const handle2FAVerify = async (otp: string) => {
  //   try {
  //     setFaError(false);
  //     const res = await verify2FA({
  //       identifier: username,
  //       otp,
  //       remember_me: rememberMe,
  //     }).unwrap();

  //     const token = res.data.access_token || tempToken;
  //     dispatch(setToken(token));
  //     toast.success("Login Successful!");
  //     if (redirect) {
  //       const decodedRedirect = decodeURIComponent(redirect as string);
  //       router.push(decodedRedirect);
  //     } else router.push("/search-page");
  //   } catch (err: any) {
  //     setFaError(true);
  //     handleError(err);
  //   }
  // };

  const handleEmailOtpTyping = () => {
    if (emailError) {
      setEmailError(false);
    }
  };

  const handle2FAOtpTyping = () => {
    if (faError) {
      setFaError(false);
    }
  };

  return (
    <div className="max-w-7xl container mx-auto w-full flex items-center justify-center min-h-screen bg-bg">
      <div className="flex items-center justify-center w-full">
        {step === "login" && (
          <LoginForm
            onSubmit={handleLogin}
            isLoggingIn={isLoggingIn}
            companyName={settingsData?.data?.company_name || "STech"}
            companyLogo={settingsData?.data?.company_logo || "/logo.svg"}
          />
        )}

        {/* Email Verification - Currently Disabled */}
        {/* {step === "email" && (
          <EmailVerificationForm
            onSubmit={handleEmailVerify}
            onResend={handleResendEmail}
            isVerifying={isVerifyingEmail}
            isResending={isResending}
            resendCountdown={resendCountdown}
            setResendCountdown={setResendCountdown}
            hasError={emailError}
            onTyping={handleEmailOtpTyping}
          />
        )} */}

        {/* 2FA - Currently Disabled */}
        {/* {step === "2fa" && (
          <TwoFAForm
            onSubmit={handle2FAVerify}
            isVerifying={isVerifying2FA}
            hasError={faError}
            onTyping={handle2FAOtpTyping}
          />
        )} */}
      </div>
    </div>
  );
};

export default Login;
