"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type FormData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const requestOtp = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/forget-password-user`,
        { email }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      setServerError(null);
      setUserEmail(variables.email);
      setStep("otp");
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Failed to send OTP.";
      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) throw new Error("User email not found");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-password-user`,
        {
          email: userEmail,
          otp: otp.join(""),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("reset");
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Failed to verify OTP.";
      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) throw new Error("Password is required");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reset-password-user`,
        { email: userEmail, newPassword: password }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("email");
      toast.success(
        "Password reset successfully. You can now login with your new password."
      );
      router.push("/login");
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Failed to reset password.";
      setServerError(errorMessage);
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmitEmail = ({ email }: { email: string }) => {
    requestOtp.mutate({ email });
  };

  const onSubmitPassword = ({ password }: { password: string }) => {
    resetPasswordMutation.mutate({ password });
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot Password
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg space-y-4">
          {step === "email" && (
            <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="zeyus@example.com"
                  className="w-full p-2 border border-gray-300 outline-0 rounded"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={requestOtp.isPending}
                className="w-full bg-black text-white p-2 rounded"
              >
                {requestOtp.isPending ? "Submitting..." : "Submit"}
              </button>
              {serverError && (
                <p className="text-red-500 text-sm">{serverError}</p>
              )}
            </form>
          )}

          {step === "otp" && (
            <>
              <h3 className="text-xl font-semibold text-center mb-2">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-4 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    className="w-12 h-12 text-center border border-gray-300 outline-none rounded"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>
              <button
                className="w-full text-lg bg-black text-white py-2 rounded-lg"
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
              </button>
              {canResend ? (
                <button
                  onClick={() => {
                    if (userEmail) requestOtp.mutate({ email: userEmail });
                  }}
                  className="text-black font-medium cursor-pointer mt-4"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-gray-500 text-sm mt-2">
                  Resend OTP in {timer} seconds
                </p>
              )}
              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}
            </>
          )}

          {step === "reset" && (
            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
              <h3 className="text-xl font-semibold text-center mb-2">
                Reset Password
              </h3>
              <div>
                <label className="block text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full p-2 border border-gray-300 outline-0 rounded"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full bg-black text-white p-2 rounded"
              >
                {resetPasswordMutation.isPending
                  ? "Resetting..."
                  : "Reset Password"}
              </button>
              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;