"use client";
import { HiOutlineMail } from "react-icons/hi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

const RequestResetForm = ({
  onRequestReset,
  isSending,
}: {
  onRequestReset: (email: string) => void;
  isSending: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = (data: EmailFormData) => {
    onRequestReset(data.email);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="lg:w-[450px] sm:w-[400px] w-full p-7 bg-gradient-to-br from-[#13f0ee]/0 to-white/10 rounded-xl
      border border-white/30 backdrop-blur-[20.8px] flex flex-col justify-between"
    >
      <h1 className="text_highlight-alpha text-xl font-semibold text-center mb-2">
        Forgot Password? Let&apos;s change it (1/3)
      </h1>

      <p className="text_highlight-beta text-sm text-center mb-8">
        Kindly enter your email to receive a verification code.
      </p>

      <div className="relative">
        <div className="relative h-10">
          <HiOutlineMail className="absolute left-3 top-4 text_highlight-alpha text-lg" />
          <input
            type="email"
            {...register("email")}
            placeholder="Enter Email"
            className={`w-full pl-10 pr-4 py-3 rounded-lg bg-transparent border text-white placeholder-dark-beta focus:outline-none focus:ring-0 ${
              errors.email
                ? "border-red-500"
                : "border-[#CCCCCC] focus:border-dark-emerald-light"
            }`}
          />
        </div>

        {errors.email && (
          <p className="text-red-500 text-sm mt-4">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="w-[70%] mt-10 mx-auto text-lg bg-dark-emerald-lighter text-black font-semibold py-2.5 rounded-xl text_highlight-alpha hover:opacity-90 transition disabled:opacity-50"
      >
        {isSending ? "Sending..." : "Send Code"}
      </button>

      <p className="text_highlight-alpha text-sm text-center mt-6 font-semibold">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text_highlight-emerald-lighter font-bold hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
};

export default RequestResetForm;
