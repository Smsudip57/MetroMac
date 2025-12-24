"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HiOutlineLockClosed } from "react-icons/hi";
import { useState } from "react";
import { FiEyeOff } from "react-icons/fi";
import { FiEye } from "react-icons/fi";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const ResetPasswordForm = ({
  onDone,
  isResettingPassword,
}: {
  onDone: (values: { password: string; confirm: string }) => void;
  isResettingPassword: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = (data: PasswordFormData) => {
    onDone(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="lg:w-[450px] sm:w-[400px] w-full p-7 bg-gradient-to-br from-[#13f0ee]/0 to-white/10 rounded-xl
      border border-white/30 backdrop-blur-[20.8px] flex flex-col justify-between"
    >
      <h1 className="text_highlight-alpha text-xl font-semibold text-center mb-2">
        Forgot Password? Let&apos;s change it (3/3)
      </h1>

      <p className="text_highlight-beta text-sm text-center mb-8">
        Kindly enter your new password.
      </p>

      <div className="relative mb-4">
        <div className="relative">
          <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg" />
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="Enter Password"
            className={`w-full pl-10 pr-10 py-3 rounded-lg bg-transparent border text-white placeholder-dark-beta focus:outline-none focus:ring-0 ${
              errors.password
                ? "border-red-500"
                : "border-[#CCCCCC] focus:border-dark-emerald-light"
            }`}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white cursor-pointer text-sm"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </span>
        </div>

        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="relative mb-4">
        <div className="relative">
          <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirm")}
            placeholder="Confirm Password"
            className={`w-full pl-10 pr-10 py-3 rounded-lg bg-transparent border text-white placeholder-dark-beta focus:outline-none focus:ring-0 ${
              errors.confirm
                ? "border-red-500"
                : "border-[#CCCCCC] focus:border-dark-emerald-light"
            }`}
          />

          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white cursor-pointer text-sm"
          >
            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </span>
        </div>

        {errors.confirm && (
          <p className="text-red-500 text-sm mt-1">{errors.confirm.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isResettingPassword}
        className="w-[70%] mt-6 mx-auto text-lg bg-dark-emerald-lighter text-black font-semibold py-2.5 rounded-xl text_highlight-alpha hover:opacity-90 transition disabled:opacity-50"
      >
        {isResettingPassword ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
};

export default ResetPasswordForm;
