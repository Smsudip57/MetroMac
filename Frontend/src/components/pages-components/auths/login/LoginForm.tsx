import { HiOutlineMail } from "react-icons/hi";
import { HiOutlineLockClosed } from "react-icons/hi2";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember_me: z.boolean().optional(),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginForm = ({
  onSubmit,
  isLoggingIn,
  companyName = "STech",
  companyLogo,
}: {
  onSubmit: (data: LoginFormInputs) => void;
  isLoggingIn: boolean;
  companyName?: string;
  companyLogo?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="lg:w-[450px] sm:w-[400px] w-full p-7 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-border backdrop-blur-[20.8px] flex flex-col justify-between"
    >
      <div className="flex flex-col items-center gap-4 mb-6">
        {companyLogo && (
          <Image
            src={companyLogo}
            alt={companyName || "Company Logo"}
            width={1000000000000000000}
            height={1000000000000000000}
            quality={100}
            className="h-16 w-auto object-contain"
          />
        )}
        <div className="text-center">
          <h1 className="text-text text-lg font-semibold">Welcome to</h1>
          <p className="text-text text-2xl font-bold">{companyName}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <div className="relative">
            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text text-lg" />
            <input
              type="text"
              {...register("username")}
              placeholder="Enter Username"
              className={`w-full pl-10 pr-4 py-3 rounded-lg bg-transparent border text-text placeholder-text/50 focus:outline-none focus:ring-0 ${
                errors.username
                  ? "border-warning"
                  : "border-border focus:border-primary"
              }`}
            />
          </div>

          {errors.username && (
            <p className="text-warning text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="relative">
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text text-lg" />
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter Password"
              className={`w-full pl-10 pr-10 py-3 rounded-lg bg-transparent border text-text placeholder-text/50 focus:outline-none focus:ring-0 ${
                errors.password
                  ? "border-warning"
                  : "border-border focus:border-primary"
              }`}
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text cursor-pointer text-sm"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
          </div>

          {errors.password && (
            <p className="text-warning text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-text ">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("remember_me")}
              className="accent-primary hover:!accent-primary size-4 rounded"
            />
            Remember Me
          </label>
          <Link
            href="/forgot-password"
            className="hover:underline font-semibold"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-[70%] mt-2 mx-auto text-lg bg-primary text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          {isLoggingIn ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
